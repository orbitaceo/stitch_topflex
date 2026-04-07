import fp from 'fastify-plugin';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import { FastifyPluginAsync } from 'fastify';

const swaggerPlugin: FastifyPluginAsync = fp(async (fastify) => {
  await fastify.register(fastifySwagger, {
    openapi: {
      openapi: '3.1.0',
      info: {
        title: 'LavaStore Pro API',
        description:
          'API REST para o LavaStore Pro — plataforma de vendas de lavadoras recondicionadas.',
        version: '1.0.0',
        contact: {
          name: 'Suporte LavaStore',
          email: 'suporte@lavaja.com.br',
        },
      },
      servers: [
        { url: 'http://localhost:3001', description: 'Development' },
        { url: 'https://api.lavaja.com.br', description: 'Production' },
      ],
      components: {
        securitySchemes: {
          BearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      security: [{ BearerAuth: [] }],
      tags: [
        { name: 'Auth', description: 'Autenticação e autorização' },
        { name: 'Products', description: 'Gestão de produtos' },
        { name: 'Orders', description: 'Gestão de pedidos' },
        { name: 'Payments', description: 'Processamento de pagamentos' },
        { name: 'Profile', description: 'Perfil do usuário' },
        { name: 'Admin', description: 'Painel administrativo' },
        { name: 'Health', description: 'Health checks' },
      ],
    },
  });

  await fastify.register(fastifySwaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'none',
      deepLinking: false,
      persistAuthorization: true,
    },
    staticCSP: true,
  });
});

export default swaggerPlugin;
