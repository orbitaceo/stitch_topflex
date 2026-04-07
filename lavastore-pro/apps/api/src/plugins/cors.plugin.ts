import fp from 'fastify-plugin';
import fastifyCors from '@fastify/cors';
import { FastifyPluginAsync } from 'fastify';
import { env } from '../config/env.js';

const corsPlugin: FastifyPluginAsync = fp(async (fastify) => {
  const origins = env.ALLOWED_ORIGINS.split(',').map((o) => o.trim());

  await fastify.register(fastifyCors, {
    origin: (origin, cb) => {
      if (!origin || origins.includes(origin)) {
        cb(null, true);
        return;
      }
      cb(new Error('Not allowed by CORS'), false);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID', 'X-Request-Source'],
    credentials: true,
    maxAge: 86400,
  });
});

export default corsPlugin;
