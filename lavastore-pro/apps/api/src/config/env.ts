import { z } from 'zod';

const envSchema = z.object({
  // App
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  API_PORT: z.coerce.number().default(3001),
  API_HOST: z.string().default('0.0.0.0'),

  // Database
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid PostgreSQL URL'),

  // Redis
  REDIS_URL: z.string().url('REDIS_URL must be a valid Redis URL'),

  // JWT
  JWT_PRIVATE_KEY: z.string().min(1, 'JWT_PRIVATE_KEY is required'),
  JWT_PUBLIC_KEY: z.string().min(1, 'JWT_PUBLIC_KEY is required'),

  // CORS
  ALLOWED_ORIGINS: z.string().min(1, 'ALLOWED_ORIGINS is required'),

  // Mercado Pago
  MP_ACCESS_TOKEN: z.string().min(1, 'MP_ACCESS_TOKEN is required').optional(),
  MP_PUBLIC_KEY: z.string().min(1, 'MP_PUBLIC_KEY is required').optional(),
  MP_WEBHOOK_SECRET: z.string().optional(),

  // Uploads
  UPLOAD_DIR: z.string().default('./uploads'),
  UPLOAD_MAX_SIZE_MB: z.coerce.number().default(10),

  // Email
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_SECURE: z.coerce.boolean().default(false),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),

  // Sentry
  SENTRY_DSN_API: z.string().optional(),
});

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// Carrega .env manualmente se não estiver usando dotenv ou --env-file
const tryLoadEnv = () => {
  const envPaths = [join(process.cwd(), '.env'), join(process.cwd(), 'apps/api/.env'), join(process.cwd(), '../../.env')];
  for (const envPath of envPaths) {
    if (existsSync(envPath)) {
      const content = readFileSync(envPath, 'utf8');
      content.split('\n').forEach(line => {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
          const key = match[1];
          let value = match[2] || '';
          if (!key) return;
          if (value.length > 0 && value.charAt(0) === '"' && value.charAt(value.length - 1) === '"') {
            value = value.replace(/\\n/gm, '\n');
          }
          value = value.replace(/(^['"]|['"]$)/g, '').trim();
          if (!process.env[key]) {
            process.env[key] = value;
          }
        }
      });
      break;
    }
  }
};
tryLoadEnv();

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;
