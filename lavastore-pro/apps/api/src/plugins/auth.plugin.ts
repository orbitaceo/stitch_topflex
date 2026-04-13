import fp from 'fastify-plugin';
import { FastifyPluginAsync, FastifyRequest } from 'fastify';
import { importSPKI, jwtVerify } from 'jose';
import { env } from '../config/env.js';

export interface JwtPayload {
  sub: string;       // userId
  email: string;
  role: string;
  iat: number;
  exp: number;
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: JwtPayload;
  }
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: any) => Promise<void>;
  }
}

const authPlugin: FastifyPluginAsync = fp(async (fastify) => {
  const publicKey = await importSPKI(
    env.JWT_PUBLIC_KEY.replace(/\\n/g, '\n'),
    'RS256',
  );

  // Decorator para verificar JWT em rotas protegidas
  fastify.decorate(
    'authenticate',
    async (request: FastifyRequest) => {
      const authHeader = request.headers.authorization;

      if (!authHeader?.startsWith('Bearer ')) {
        const err = new Error('Missing or invalid authorization header') as any;
        err.statusCode = 401;
        throw err;
      }

      const token = authHeader.slice(7);

      try {
        const { payload } = await jwtVerify(token, publicKey, {
          algorithms: ['RS256'],
        });
        request.user = payload as unknown as JwtPayload;
      } catch {
        const err = new Error('Invalid or expired token') as any;
        err.statusCode = 401;
        throw err;
      }
    },
  );
});

export default authPlugin;
