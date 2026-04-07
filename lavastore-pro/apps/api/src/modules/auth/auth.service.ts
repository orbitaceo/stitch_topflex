import { PrismaClient } from '@prisma/client';
import { FastifyBaseLogger } from 'fastify';
import {
  hashPassword,
  verifyPassword,
  validatePasswordStrength,
  signAccessToken,
  generateRefreshToken,
  hashRefreshToken,
  refreshTokenExpiresAt,
} from '../../shared/utils/auth.utils.js';
import { httpErrors } from '../../shared/utils/http-errors.js';
import { env } from '../../config/env.js';
import { randomBytes } from 'crypto';
import Redis from 'ioredis';
import { EmailService } from '../email/email.service.js';
import type {
  RegisterInput,
  LoginInput,
  RefreshInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  VerifyEmailInput,
} from './auth.schema.js';

type SafeUser = {
  id: string;
  email: string;
  role: string;
  emailVerified: boolean;
  profile: { firstName: string; lastName: string } | null;
};

export class AuthService {
  private emailService: EmailService;
  private redis: Redis;

  constructor(
    private readonly prisma: PrismaClient,
    private readonly log: FastifyBaseLogger,
  ) {
    this.emailService = new EmailService();
    this.redis = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      retryStrategy: (times) => Math.min(times * 50, 2000),
    });
  }

  // ── REGISTER ─────────────────────────────────────────────────────

  async register(input: RegisterInput) {
    const pwError = validatePasswordStrength(input.password);
    if (pwError) throw httpErrors.badRequest(pwError);

    const existing = await this.prisma.user.findUnique({
      where: { email: input.email },
      select: { id: true },
    });
    if (existing) {
      throw httpErrors.conflict('Não foi possível criar a conta com esses dados.');
    }

    const passwordHash = await hashPassword(input.password);

    const user = await this.prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        profile: {
          create: {
            firstName: input.firstName,
            lastName: input.lastName,
            phone: input.phone,
          },
        },
      },
      select: {
        id: true,
        email: true,
        role: true,
        emailVerified: true,
        profile: { select: { firstName: true, lastName: true } },
      },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'user.register',
        resource: 'User',
        resourceId: user.id,
      },
    });

    try {
      const token = randomBytes(32).toString('hex');
      await this.redis.setex(`verify:${token}`, 60 * 60 * 24, user.id); // 24 horas
      await this.emailService.sendVerificationEmail(user.email, token);
    } catch (err) {
      this.log.error(err, 'Failed to queue verification email');
    }

    return { user, message: 'Conta criada com sucesso! Verifique seu e-mail.' };
  }

  // ── LOGIN ─────────────────────────────────────────────────────────

  async login(input: LoginInput, ipAddress?: string, userAgent?: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: input.email },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        role: true,
        isActive: true,
        emailVerified: true,
        profile: { select: { firstName: true, lastName: true } },
      },
    });

    const isValid = user ? await verifyPassword(input.password, user.passwordHash) : false;
    if (!user || !isValid) {
      await this.prisma.auditLog.create({
        data: {
          action: 'user.login.failed',
          resource: 'User',
          ipAddress,
          userAgent,
          newData: { email: input.email },
        },
      });
      throw httpErrors.unauthorized('E-mail ou senha inválidos.');
    }

    if (!user.isActive) {
      throw httpErrors.forbidden('Conta desativada. Entre em contato com o suporte.');
    }

    const accessToken = await signAccessToken(
      { sub: user.id, email: user.email, role: user.role },
      env.JWT_PRIVATE_KEY,
    );

    const rawRefreshToken = generateRefreshToken();
    const hashedRefreshToken = hashRefreshToken(rawRefreshToken);

    await this.prisma.refreshToken.create({
      data: {
        token: hashedRefreshToken,
        userId: user.id,
        expiresAt: refreshTokenExpiresAt(),
        ipAddress,
        userAgent,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'user.login',
        resource: 'User',
        resourceId: user.id,
        ipAddress,
        userAgent,
      },
    });

    const safeUser: SafeUser = {
      id: user.id,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified,
      profile: user.profile,
    };

    return { user: safeUser, accessToken, refreshToken: rawRefreshToken };
  }

  // ── REFRESH ───────────────────────────────────────────────────────

  async refresh(input: RefreshInput, ipAddress?: string, userAgent?: string) {
    const hashedToken = hashRefreshToken(input.refreshToken);

    const stored = await this.prisma.refreshToken.findUnique({
      where: { token: hashedToken },
      include: {
        user: { select: { id: true, email: true, role: true, isActive: true } },
      },
    });

    if (stored?.isRevoked) {
      await this.prisma.refreshToken.updateMany({
        where: { userId: stored.userId },
        data: { isRevoked: true },
      });
      this.log.warn({ userId: stored.userId }, 'Refresh token reuse attack detected — all tokens revoked');
      throw httpErrors.unauthorized('Sessão inválida. Faça login novamente.');
    }

    if (!stored || stored.expiresAt < new Date() || !stored.user.isActive) {
      throw httpErrors.unauthorized('Sessão expirada. Faça login novamente.');
    }

    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { isRevoked: true },
    });

    const accessToken = await signAccessToken(
      { sub: stored.user.id, email: stored.user.email, role: stored.user.role },
      env.JWT_PRIVATE_KEY,
    );

    const newRaw = generateRefreshToken();
    const newHashed = hashRefreshToken(newRaw);

    await this.prisma.refreshToken.create({
      data: {
        token: newHashed,
        userId: stored.user.id,
        expiresAt: refreshTokenExpiresAt(),
        ipAddress,
        userAgent,
      },
    });

    return { accessToken, refreshToken: newRaw };
  }

  // ── LOGOUT ────────────────────────────────────────────────────────

  async logout(rawRefreshToken: string) {
    const hashedToken = hashRefreshToken(rawRefreshToken);
    await this.prisma.refreshToken.updateMany({
      where: { token: hashedToken },
      data: { isRevoked: true },
    });
  }

  // ── ME ────────────────────────────────────────────────────────────

  async me(userId: string): Promise<SafeUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        emailVerified: true,
        profile: { select: { firstName: true, lastName: true } },
      },
    });
    if (!user) throw httpErrors.notFound('Usuário não encontrado.');
    return user;
  }

  // ── FORGOT PASSWORD ───────────────────────────────────────────────

  async forgotPassword(input: ForgotPasswordInput) {
    const user = await this.prisma.user.findUnique({
      where: { email: input.email },
      select: { id: true, email: true },
    });
    if (user) {
      this.log.info({ userId: user.id }, 'Password reset requested');
      try {
        const token = randomBytes(32).toString('hex');
        await this.redis.setex(`reset:${token}`, 60 * 60 * 1, user.id); // 1 hora
        await this.emailService.sendPasswordResetEmail(user.email, token);
      } catch (err) {
        this.log.error(err, 'Failed to queue password reset email');
      }
    }
    return { message: 'Se houver uma conta com esse e-mail, você receberá as instruções em breve.' };
  }

  // ── RESET PASSWORD ────────────────────────────────────────────────

  async resetPassword(input: ResetPasswordInput) {
    const pwError = validatePasswordStrength(input.password);
    if (pwError) throw httpErrors.badRequest(pwError);
    
    const userId = await this.redis.get(`reset:${input.token}`);
    if (!userId) {
      throw httpErrors.badRequest('Token inválido ou expirado.');
    }

    const passwordHash = await hashPassword(input.password);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    await this.redis.del(`reset:${input.token}`);
    
    this.log.info({ userId }, 'Password successfully reset');
    return { message: 'Senha alterada com sucesso.' };
  }

  // ── VERIFY EMAIL ──────────────────────────────────────────────────

  async verifyEmail(input: VerifyEmailInput) {
    const userId = await this.redis.get(`verify:${input.token}`);
    if (!userId) {
      throw httpErrors.badRequest('Token inválido ou expirado.');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { emailVerified: true },
    });

    await this.redis.del(`verify:${input.token}`);
    return { message: 'E-mail verificado com sucesso.' };
  }
}
