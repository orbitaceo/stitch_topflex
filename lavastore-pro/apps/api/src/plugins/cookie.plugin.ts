import fp from 'fastify-plugin';
import fastifyCookie from '@fastify/cookie';
import { FastifyPluginAsync } from 'fastify';

const cookiePlugin: FastifyPluginAsync = fp(async (fastify) => {
  await fastify.register(fastifyCookie, {
    // Secret usado para assinar cookies (não é o mesmo que o JWT secret)
    secret: process.env['COOKIE_SECRET'] ?? 'lavastore-cookie-secret-change-on-prod',
    hook: 'onRequest',
  });
});

export default cookiePlugin;
