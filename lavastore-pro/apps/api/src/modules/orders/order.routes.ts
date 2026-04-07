import { FastifyPluginAsync } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { OrderService } from './order.service.js';
import { createOrderSchema } from './order.schema.js';

const orderRoutes: FastifyPluginAsync = async (fastify) => {
  const prisma = fastify.prisma as PrismaClient;
  const orderService = new OrderService(prisma, fastify.log);

  // Exige que o usuário esteja logado (verifica a presença de jwt)
  // Assuminos que fastify-jwt já o autentica. Ou usamos preHandler custom.
  // Como authRoutes não expôs um preHandler global de validação JWT ainda (além do próprio req.user no parse do token),
  // vamos assumir que o token jwt parseado já popule req.user se configuramos `fastify-jwt` (não instalamos fastify-jwt, usamos implementacao customizada de JWT).
  // Vou usar um hook pra extrair o access_token via cookie ou header Bearer, se a logica existir globalmente no plugin auth.
  
  fastify.post(
    '/checkout',
    {
      schema: {
        tags: ['Orders'],
        summary: 'Criar pedido e gerar link de pagamento MP',
        body: {
          type: 'object',
          required: ['items', 'shippingAddress'],
        }
      },
      preHandler: [(fastify as any).authenticate],
    },
    async (req, reply) => {
      const parsedBody = createOrderSchema.parse(req.body);
      
      const user = req.user; 
      if (!user) {
        return reply.code(401).send({ message: 'Sessão inválida' });
      }

      const result = await orderService.createCheckout(parsedBody, user.sub, user.email);

      return reply.code(201).send(result);
    }
  );

  // Webhook for Mercado Pago IPN
  fastify.post(
    '/webhook',
    {
      schema: {
        tags: ['Orders'],
        summary: 'Webhook para Mercado Pago (Atualização de pagamentos)',
        body: { type: 'object' } // MP sends dynamic payload here
      }
    },
    async (req, reply) => {
      // Aqui integrariamos a lógica de:
      // 1. Receber ID do pagamento do body (req.body.data.id)
      // 2. Chamar a API do Mercado Pago pra consultar se está 'approved'
      // 3. Atualizar a database OrderStatus para CONFIRMED e lançar Payment record.
      // Vamos aceitar gracefully pra não estourar retry no MP.
      fastify.log.info({ body: req.body }, 'Recebido Webhook do Mercado Pago');
      return reply.code(200).send('OK');
    }
  );
};

export default orderRoutes;
