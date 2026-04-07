import fp from 'fastify-plugin';
import fastifyHelmet from '@fastify/helmet';
import { FastifyPluginAsync } from 'fastify';

const helmetPlugin: FastifyPluginAsync = fp(async (fastify) => {
  await fastify.register(fastifyHelmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'blob:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    frameguard: { action: 'deny' },
    noSniff: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    permittedCrossDomainPolicies: { permittedPolicies: 'none' },
  });

  // Remove server identification headers
  fastify.addHook('onSend', async (_req, reply) => {
    reply.removeHeader('x-powered-by');
    reply.removeHeader('server');
  });
});

export default helmetPlugin;
