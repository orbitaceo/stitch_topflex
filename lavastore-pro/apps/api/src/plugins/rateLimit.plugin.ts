import fp from 'fastify-plugin';
import fastifyRateLimit from '@fastify/rate-limit';
import { FastifyPluginAsync } from 'fastify';

const rateLimitPlugin: FastifyPluginAsync = fp(async (fastify) => {
  await fastify.register(fastifyRateLimit, {
    // Limite global padrão
    max: 1000,
    timeWindow: '1 minute',
    errorResponseBuilder: (_req, context) => ({
      statusCode: 429,
      error: 'Too Many Requests',
      message: `Rate limit exceeded. Retry after ${Math.ceil(context.ttl / 1000)} seconds.`,
    }),
    keyGenerator: (req) => {
      // Usa o IP real mesmo atrás de proxy
      return (
        (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ??
        req.ip
      );
    },
  });
});

export default rateLimitPlugin;
