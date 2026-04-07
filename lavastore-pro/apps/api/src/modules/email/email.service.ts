import { env } from '../../config/env.js';

interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

export class EmailService {
  constructor() {}

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const verificationUrl = `http://localhost:3000/verify-email?token=${token}`;
    await this.enqueue({
      to: email,
      subject: 'LavaJá - Verifique seu e-mail',
      html: `
        <h1>Bem-vindo(a) à LavaJá!</h1>
        <p>Por favor, confirme seu endereço de e-mail clicando no link abaixo:</p>
        <a href="${verificationUrl}">${verificationUrl}</a>
      `,
    });
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const resetUrl = `http://localhost:3000/reset-password?token=${token}`;
    await this.enqueue({
      to: email,
      subject: 'LavaJá - Recuperação de Senha',
      html: `
        <h1>Recuperação de Senha</h1>
        <p>Você solicitou a redefinição de sua senha. Clique no link abaixo para criar uma nova senha:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>Se você não solicitou isso, apenas ignore este e-mail.</p>
      `,
    });
  }

  private async enqueue(options: MailOptions): Promise<void> {
    // Importa dinamicamente a view para evitar falhas caso Redis não esteja rodando nativamente
    // durante o ambiente de dev (uma falência silenciosa para que o log registre a fila)
    try {
      const { emailQueue } = await import('./email.queue.js');
      await emailQueue.add('send-email', options);
      console.log(`📧 E-mail enfileirado para envio: ${options.to}`);
    } catch (err) {
      console.error(`❌ Erro ao enfileirar e-mail para ${options.to}:`, err);
      // Para o ambiente local sem Redis rodando: fallback para logging console
      if (env.NODE_ENV === 'development') {
        console.log(`[STUB] E-mail que seria enviado para ${options.to}:`);
        console.log(`Assunto: ${options.subject}`);
        console.log(`Conteúdo:\n${options.html}`);
      }
    }
  }
}
