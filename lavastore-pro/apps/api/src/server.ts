import Fastify from 'fastify';
import { env } from './config/env.js';

// Plugins de infraestrutura
import prismaPlugin  from './plugins/prisma.plugin.js';
import helmetPlugin  from './plugins/helmet.plugin.js';
import corsPlugin    from './plugins/cors.plugin.js';
import rateLimitPlugin from './plugins/rateLimit.plugin.js';
import swaggerPlugin from './plugins/swagger.plugin.js';
import authPlugin    from './plugins/auth.plugin.js';
import cookiePlugin  from './plugins/cookie.plugin.js';

// Módulos de rotas
import authRoutes from './modules/auth/auth.routes.js';
import productsRoutes from './modules/products/products.routes.js'; // Sprint 3
import orderRoutes   from './modules/orders/order.routes.js';     // Sprint 4
// import paymentsRoutes from './modules/payments/payments.routes.js'; // Sprint 5

const fastify = Fastify({
  logger: {
    level: env.NODE_ENV === 'development' ? 'debug' : 'info',
  },
  connectionTimeout: 30000,
  bodyLimit: 10 * 1024 * 1024,
  genReqId: () => crypto.randomUUID(),
});

async function buildServer() {
  // ── Segurança (ordem importa) ──────────────────────────────────
  await fastify.register(helmetPlugin);
  await fastify.register(corsPlugin);
  await fastify.register(rateLimitPlugin);
  await fastify.register(cookiePlugin);

  // ── Banco de dados ─────────────────────────────────────────────
  await fastify.register(prismaPlugin);

  // ── Autenticação JWT ───────────────────────────────────────────
  await fastify.register(authPlugin);

  // ── Documentação (não disponível em produção) ──────────────────
  if (env.NODE_ENV !== 'production') {
    await fastify.register(swaggerPlugin);
  }

  // ── Health Check ───────────────────────────────────────────────
  fastify.get(
    '/health',
    {
      schema: {
        tags: ['Health'],
        summary: 'Health check',
        security: [],
        response: {
          200: {
            type: 'object',
            properties: {
              status:    { type: 'string' },
              timestamp: { type: 'string' },
              version:   { type: 'string' },
              uptime:    { type: 'number' },
            },
          },
        },
      },
      config: { rateLimit: { max: 60, timeWindow: '1 minute' } },
    },
    async () => ({
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      uptime: Math.floor(process.uptime()),
    }),
  );

  // ── Rotas de negócio ───────────────────────────────────────────
  await fastify.register(authRoutes,     { prefix: '/v1/auth' });
  await fastify.register(productsRoutes, { prefix: '/v1/products' });
  await fastify.register(orderRoutes,   { prefix: '/v1/orders' });
  // await fastify.register(paymentsRoutes, { prefix: '/v1/payments' });

  return fastify;
}

async function start() {
  try {
    const server = await buildServer();
    await server.listen({ port: env.API_PORT, host: env.API_HOST });

    const shutdown = async (signal: string) => {
      server.log.info(`Received ${signal} — shutting down gracefully...`);
      await server.close();
      process.exit(0);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT',  () => shutdown('SIGINT'));
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
