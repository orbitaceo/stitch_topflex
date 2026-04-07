import { createHash, randomBytes } from 'crypto';
import bcrypt from 'bcryptjs';
import { importPKCS8, importSPKI, SignJWT, jwtVerify } from 'jose';

const BCRYPT_ROUNDS = 12;

// ── Senha ──────────────────────────────────────────────────────────

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function validatePasswordStrength(password: string): string | null {
  if (password.length < 12)          return 'Senha deve ter no mínimo 12 caracteres';
  if (!/[A-Z]/.test(password))       return 'Senha deve conter ao menos uma letra maiúscula';
  if (!/[a-z]/.test(password))       return 'Senha deve conter ao menos uma letra minúscula';
  if (!/[0-9]/.test(password))       return 'Senha deve conter ao menos um número';
  if (!/[!@#$%^&*()_+\-=\[\]{}|;':",.<>\/?]/.test(password))
    return 'Senha deve conter ao menos um caractere especial';
  return null;
}

// ── JWT (RS256 assimétrico) ────────────────────────────────────────

export async function signAccessToken(
  payload: { sub: string; email: string; role: string },
  privateKeyPem: string,
): Promise<string> {
  const privateKey = await importPKCS8(privateKeyPem.replace(/\\n/g, '\n'), 'RS256');
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'RS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .setIssuer('lavastore-api')
    .sign(privateKey);
}

export async function verifyAccessToken(
  token: string,
  publicKeyPem: string,
): Promise<{ sub: string; email: string; role: string }> {
  const publicKey = await importSPKI(publicKeyPem.replace(/\\n/g, '\n'), 'RS256');
  const { payload } = await jwtVerify(token, publicKey, {
    algorithms: ['RS256'],
    issuer: 'lavastore-api',
  });
  return payload as { sub: string; email: string; role: string };
}

// ── Refresh Token ─────────────────────────────────────────────────

/** Gera um refresh token seguro (32 bytes = 64 hex chars) */
export function generateRefreshToken(): string {
  return randomBytes(32).toString('hex');
}

/** Hash SHA-256 do token para armazenar no banco */
export function hashRefreshToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/** Gera data de expiração (7 dias) */
export function refreshTokenExpiresAt(): Date {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d;
}

// ── Números de ordem ──────────────────────────────────────────────

export function generateOrderNumber(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = randomBytes(3).toString('hex').toUpperCase();
  return `LVJ-${ts}-${rand}`;
}
