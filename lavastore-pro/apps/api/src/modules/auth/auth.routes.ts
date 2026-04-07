import { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from './auth.service.js';
import { HttpError } from '../../shared/utils/http-errors.js';
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from './auth.schema.js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env['NODE_ENV'] === 'production',
  sameSite: 'lax' as const,
  path: '/v1/auth/refresh',
  maxAge: 60 * 60 * 24 * 7, // 7 dias
};

const authRoutes: FastifyPluginAsync = async (fastify) => {
  const authService = new AuthService(fastify.prisma, fastify.log);

  // Error handler local para converter HttpError → Fastify response
  fastify.setErrorHandler(async (error, _req, reply) => {
    if (error instanceof HttpError) {
      return reply.code(error.statusCode).send({
        statusCode: error.statusCode,
        error: error.name,
        message: error.message,
      });
    }
    // Zod validation errors
    if (error.name === 'ZodError') {
      return reply.code(400).send({
        statusCode: 400,
        error: 'Validation Error',
        message: 'Dados inválidos.',
        issues: (error as any).issues,
      });
    }
    fastify.log.error(error);
    return reply.code(500).send({ statusCode: 500, error: 'Internal Server Error', message: 'Erro interno.' });
  });

  // ── POST /auth/register ─────────────────────────────────────────
  fastify.post(
    '/register',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Criar nova conta',
        body: {
          type: 'object',
          required: ['email', 'password', 'firstName', 'lastName'],
          properties: {
            email:     { type: 'string', format: 'email' },
            password:  { type: 'string', minLength: 12 },
            firstName: { type: 'string', minLength: 2 },
            lastName:  { type: 'string', minLength: 2 },
            phone:     { type: 'string' },
          },
        },
      },
      config: { rateLimit: { max: 3, timeWindow: '1 hour' } },
    },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const input = registerSchema.parse(req.body);
      const result = await authService.register(input);
      return reply.code(201).send(result);
    },
  );

  // ── POST /auth/login ─────────────────────────────────────────────
  fastify.post(
    '/login',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Login com e-mail e senha',
        body: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email:    { type: 'string', format: 'email' },
            password: { type: 'string' },
          },
        },
      },
      config: { rateLimit: { max: 5, timeWindow: '15 minutes' } },
    },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const input = loginSchema.parse(req.body);
      const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ?? req.ip;
      const ua = req.headers['user-agent'];
      const result = await authService.login(input, ip, ua);

      reply.setCookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);

      return reply.send({
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });
    },
  );

  // ── POST /auth/refresh ───────────────────────────────────────────
  fastify.post(
    '/refresh',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Renovar access token',
        body: {
          type: 'object',
          properties: { refreshToken: { type: 'string' } },
        },
      },
      config: { rateLimit: { max: 30, timeWindow: '1 minute' } },
    },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const cookieToken = req.cookies?.['refreshToken'];
      const body = req.body as { refreshToken?: string };
      const rawToken = body?.refreshToken ?? cookieToken;

      if (!rawToken) {
        return reply.code(400).send({ statusCode: 400, error: 'Bad Request', message: 'Refresh token é obrigatório.' });
      }

      const input = refreshSchema.parse({ refreshToken: rawToken });
      const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ?? req.ip;
      const ua = req.headers['user-agent'];
      const result = await authService.refresh(input, ip, ua);

      reply.setCookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);
      return reply.send(result);
    },
  );

  // ── POST /auth/logout ────────────────────────────────────────────
  fastify.post(
    '/logout',
    {
      schema: { tags: ['Auth'], summary: 'Logout e revogação de sessão' },
      preHandler: [fastify.authenticate],
    },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const body = req.body as { refreshToken?: string };
      const cookieToken = req.cookies?.['refreshToken'];
      const rawToken = body?.refreshToken ?? cookieToken ?? '';
      if (rawToken) await authService.logout(rawToken);
      reply.clearCookie('refreshToken', { path: '/v1/auth/refresh' });
      return reply.send({ message: 'Logout realizado com sucesso.' });
    },
  );

  // ── GET /auth/me ──────────────────────────────────────────────────
  fastify.get(
    '/me',
    {
      schema: { tags: ['Auth'], summary: 'Dados do usuário autenticado' },
      preHandler: [fastify.authenticate],
    },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const user = await authService.me(req.user!.sub);
      return reply.send(user);
    },
  );

  // ── POST /auth/forgot-password ───────────────────────────────────
  fastify.post(
    '/forgot-password',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Solicitar redefinição de senha',
        body: {
          type: 'object',
          required: ['email'],
          properties: { email: { type: 'string', format: 'email' } },
        },
      },
      config: { rateLimit: { max: 3, timeWindow: '1 hour' } },
    },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const input = forgotPasswordSchema.parse(req.body);
      const result = await authService.forgotPassword(input);
      return reply.send(result);
    },
  );

  // ── POST /auth/reset-password ────────────────────────────────────
  fastify.post(
    '/reset-password',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Confirmar nova senha com token',
        body: {
          type: 'object',
          required: ['token', 'password'],
          properties: {
            token:    { type: 'string' },
            password: { type: 'string', minLength: 12 },
          },
        },
      },
      config: { rateLimit: { max: 5, timeWindow: '1 hour' } },
    },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const input = resetPasswordSchema.parse(req.body);
      const result = await authService.resetPassword(input);
      return reply.send(result);
    },
  );

  // ── POST /auth/verify-email ──────────────────────────────────────
  fastify.post(
    '/verify-email',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Verificar e-mail com token',
        body: {
          type: 'object',
          required: ['token'],
          properties: { token: { type: 'string' } },
        },
      },
      config: { rateLimit: { max: 10, timeWindow: '1 hour' } },
    },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const input = verifyEmailSchema.parse(req.body);
      const result = await authService.verifyEmail(input);
      return reply.send(result);
    },
  );
};

export default authRoutes;
