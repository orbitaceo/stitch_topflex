import { Queue, Worker, Job } from 'bullmq';
import nodemailer from 'nodemailer';
import { env } from '../../config/env.js';
import Redis from 'ioredis';

// Conexão Redis usando IORedis como BullMQ exige
const connection = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  retryStrategy: (times) => {
    // Retry indefinidamente, mas aleta no log para ajudar a debugar
    if (times === 1) console.warn('⚠️ BullMQ: Redis não encontrado (Tentando conectar...)');
    return Math.min(times * 50, 2000);
  },
});

export const emailQueue = new Queue('email', { connection });

// Definir o Worker para processar os e-mails
const transport = nodemailer.createTransport({
  host: env.SMTP_HOST || 'smtp.ethereal.email',
  port: env.SMTP_PORT || 587,
  secure: env.SMTP_SECURE || false,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

export const emailWorker = new Worker(
  'email',
  async (job: Job) => {
    const { to, subject, html } = job.data;
    
    // Fallback Ethereal explícito se dados SMTP não existirem
    if (!env.SMTP_HOST && env.NODE_ENV === 'development') {
      console.log(`[STUB EMAIL WORKER] Falta SMTP_HOST. Email para ${to} logado com sucesso.`);
      return { status: 'mock-sent' };
    }

    try {
      const info = await transport.sendMail({
        from: '"LavaStore Pro" <noreply@lavastore.com.br>',
        to,
        subject,
        html,
      });
      console.log(`✅ E-mail enviado. MessageId: ${info.messageId}`);
      
      // O Ethereal gera um URL de preview dos e-mails
      if (env.SMTP_HOST === 'smtp.ethereal.email') {
        console.log(`🔗 Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      }
      return info;
    } catch (err) {
      console.error(`❌ Falha no envio do e-mail para ${to}:`, err);
      throw err;
    }
  },
  { connection }
);

emailWorker.on('failed', (job, err) => {
  console.error(`❌ BullMQ Job ${job?.id} falhou com erro: ${err.message}`);
});
