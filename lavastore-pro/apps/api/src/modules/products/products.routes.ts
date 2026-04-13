import { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient, Prisma, Voltage } from '@prisma/client';

const productsRoutes: FastifyPluginAsync = async (fastify) => {
  const prisma = fastify.prisma as PrismaClient;

  fastify.get(
    '/',
    {
      schema: {
        tags: ['Products'],
        summary: 'Listar produtos com filtros',
        querystring: {
          type: 'object',
          properties: {
            brand: { type: 'string' },
            voltage: { type: 'string' },
            sort: { type: 'string', enum: ['recent', 'price_asc', 'price_desc'] },
            limit: { type: 'number', minimum: 1, maximum: 50, default: 20 },
            page: { type: 'number', minimum: 1, default: 1 },
          },
        },
      },
    },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const { brand, voltage, sort, limit = 20, page = 1 } = req.query as { brand?: string; voltage?: string; sort?: string; limit?: number; page?: number };

      const where: Prisma.ProductWhereInput = {};
      if (brand && brand !== 'Todas') where.brand = brand;
      if (voltage && voltage !== 'Todas') where.voltage = voltage.replace('V110', 'V110').replace('V220', 'V220') as Voltage;

      let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
      if (sort === 'price_asc') orderBy = { salePrice: 'asc' };
      if (sort === 'price_desc') orderBy = { salePrice: 'desc' };

      const skip = (page - 1) * limit;

      const [items, total] = await Promise.all([
        prisma.product.findMany({ where, orderBy, take: limit, skip }),
        prisma.product.count({ where }),
      ]);

      return reply.send({
        items,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      });
    }
  );

  fastify.get(
    '/:slug',
    {
      schema: {
        tags: ['Products'],
        summary: 'Buscar produto por slug',
        params: {
          type: 'object',
          required: ['slug'],
          properties: { slug: { type: 'string' } },
        },
      },
    },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const { slug } = req.params as { slug: string };
      const product = await prisma.product.findUnique({
        where: { slug },
      });

      if (!product) {
        return reply.code(404).send({ statusCode: 404, error: 'Not Found', message: 'Produto não encontrado' });
      }

      return reply.send(product);
    }
  );
};

export default productsRoutes;
