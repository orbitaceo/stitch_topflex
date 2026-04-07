import { FastifyRequest, FastifyReply } from 'fastify';
import { JwtPayload } from '../plugins/auth.plugin.js';

type Role = 'CUSTOMER' | 'ADMIN' | 'SUPER_ADMIN';

/**
 * Cria um middleware de autorização baseado em roles.
 *
 * Uso: `preHandler: [fastify.authenticate, requireRole('ADMIN')]`
 */
export function requireRole(...allowedRoles: Role[]) {
  return async (req: FastifyRequest, reply: FastifyReply) => {
    const user = req.user as JwtPayload | undefined;
    if (!user) {
      return reply.code(401).send({ statusCode: 401, error: 'Unauthorized', message: 'Não autenticado.' });
    }
    if (!allowedRoles.includes(user.role as Role)) {
      return reply.code(403).send({
        statusCode: 403,
        error: 'Forbidden',
        message: 'Você não tem permissão para acessar este recurso.',
      });
    }
  };
}

/**
 * Garante que o usuário autenticado só pode acessar/modificar seus próprios recursos,
 * a menos que seja ADMIN.
 */
export function requireOwnerOrAdmin(getUserIdFromRequest: (req: FastifyRequest) => string) {
  return async (req: FastifyRequest, reply: FastifyReply) => {
    const user = req.user as JwtPayload | undefined;
    if (!user) {
      return reply.code(401).send({ statusCode: 401, error: 'Unauthorized', message: 'Não autenticado.' });
    }
    const resourceUserId = getUserIdFromRequest(req);
    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
    if (!isAdmin && user.sub !== resourceUserId) {
      return reply.code(403).send({
        statusCode: 403,
        error: 'Forbidden',
        message: 'Acesso negado.',
      });
    }
  };
}
