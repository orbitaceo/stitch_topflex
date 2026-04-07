import { MercadoPagoConfig, Preference } from 'mercadopago';
import { env } from '../../config/env.js';
import { FastifyBaseLogger } from 'fastify';

interface CreatePreferenceInput {
  orderId: string;
  userEmail: string;
  items: Array<{
    id: string;
    title: string;
    unit_price: number;
    quantity: number;
    picture_url?: string;
  }>;
}

export class MercadoPagoService {
  private client: MercadoPagoConfig;

  constructor(private readonly log: FastifyBaseLogger) {
    if (!env.MP_ACCESS_TOKEN) {
      this.log.warn('MP_ACCESS_TOKEN não configurado. Mock mode ativado para pagamentos.');
    }
    
    // Inicializa o SDK do Mercado Pago v2
    this.client = new MercadoPagoConfig({
      accessToken: env.MP_ACCESS_TOKEN || 'TEST-mock-token',
      options: { timeout: 5000 }
    });
  }

  async createPreference(input: CreatePreferenceInput) {
    const isMock = !env.MP_ACCESS_TOKEN || env.MP_ACCESS_TOKEN.includes('TEST-xxxx');
    if (isMock) {
      this.log.info({ orderId: input.orderId }, '[MOCK] Mimetizando criação de preferência MP.');
      return { init_point: `http://localhost:3000/checkout/success?mock_order=${input.orderId}` };
    }

    try {
      const preference = new Preference(this.client);
      
      const response = await preference.create({
        body: {
          items: input.items.map(item => ({
            id: item.id,
            title: item.title,
            unit_price: Number(item.unit_price),
            quantity: item.quantity,
            currency_id: 'BRL',
            picture_url: item.picture_url || '',
          })),
          payer: {
            email: input.userEmail,
          },
          external_reference: input.orderId,
          // URLs de retorno para redirecionar o usuário de volta após o fluxo do MP
          back_urls: {
            success: 'http://localhost:3000/checkout/success',
            pending: 'http://localhost:3000/checkout/success',
            failure: 'http://localhost:3000/checkout',
          },
          auto_return: 'approved',
          // Recebimento de Webhook na porta do nosso backend ou ngrok se houver (para modo de dev usar ngrok depois)
          notification_url: `${env.API_HOST.includes('localhost') || env.API_HOST === '0.0.0.0' ? 'https://google.com/mock-webhook' : `https://${env.API_HOST}/v1/payments/webhook`}`,
        }
      });

      return {
        id: response.id,
        init_point: response.init_point, // URL para qual redirecionaremos no front (Production)
        sandbox_init_point: response.sandbox_init_point, // URL para ambiente de testes
      };
    } catch (error) {
      this.log.error(error, 'Erro ao criar preferência no Mercado Pago');
      throw new Error('Falha na integração com o gateway de pagamento.');
    }
  }
}
