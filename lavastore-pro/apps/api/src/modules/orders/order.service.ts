import { PrismaClient, Prisma } from '@prisma/client';
import { FastifyBaseLogger } from 'fastify';
import { httpErrors } from '../../shared/utils/http-errors.js';
import { env } from '../../config/env.js';
import { MercadoPagoService } from '../payments/mp.service.js';
import type { CreateOrderInput } from './order.schema.js';

export class OrderService {
  private mpService: MercadoPagoService;

  constructor(
    private readonly prisma: PrismaClient,
    private readonly log: FastifyBaseLogger,
  ) {
    this.mpService = new MercadoPagoService(log);
  }

  async createCheckout(input: CreateOrderInput, userId: string, userEmail: string) {
    // 1. Validar e buscar os produtos (garantir preço e estoque originais)
    const productIds = input.items.map(i => i.productId);
    
    // Obter produtos e usar um "transaction" para travar em produção seria o ideal,
    // mas para simplificar consultamos.
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } }
    });

    if (products.length !== productIds.length) {
      throw httpErrors.badRequest('Alguns produtos do carrinho não foram encontrados.');
    }

    // 2. Calcular totais e checar estoque
    let subtotal = 0;
    const orderItemsConfig = input.items.map(item => {
      const product = products.find((p: { id: string }) => p.id === item.productId)!;
      
      if (product.stock < item.quantity) {
        throw httpErrors.badRequest(`Produto ${product.name} está sem estoque suficiente.`);
      }

      const itemTotal = Number(product.salePrice) * item.quantity;
      subtotal += itemTotal;

      return {
        productId: product.id,
        quantity: item.quantity,
        unitPrice: Number(product.salePrice),
        totalPrice: itemTotal,
        productName: product.name,
        productSku: product.sku,
        pictureUrl: `http://localhost:3000/placeholder-image-url.jpg` // Ideal: pegar a primeira imagem de product
      };
    });

    const shippingCost = 0; // Fixado em 0 por enquanto
    const discount = 0;
    const total = subtotal + shippingCost - discount;

    // Gerar número de pedido único: LAVA-Timestamp-Aleatorio
    const orderNumber = `LAVA-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;

    // 3. Criar Pedido (Transação no banco para reduzir o estoque instantaneamente)
    const order = await this.prisma.$transaction(async (tx: any) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId,
          status: 'PENDING' as const,
          subtotal,
          shippingCost,
          discount,
          total,
          shippingAddress: input.shippingAddress as any,
          items: {
            create: orderItemsConfig.map(i => ({
              productId: i.productId,
              quantity: i.quantity,
              unitPrice: i.unitPrice,
              totalPrice: i.totalPrice,
              productName: i.productName,
              productSku: i.productSku,
            }))
          }
        },
        include: { items: true }
      });

      // Baixar estoque preventivamente. Em caso de não pagamento em X tempo, o estoque volta (CRON / job futuro).
      for (const item of input.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        });
      }

      // Adicionar log
      await tx.auditLog.create({
        data: {
          userId,
          action: 'order.created',
          resource: 'Order',
          resourceId: newOrder.id,
        }
      });

      return newOrder;
    });

    // 4. Integrar com Mercado Pago: gerar Preferência de Pagamento
    const mpItems = orderItemsConfig.map(item => ({
      id: item.productId,
      title: item.productName,
      unit_price: item.unitPrice,
      quantity: item.quantity,
      picture_url: item.pictureUrl
    }));

    const preference = await this.mpService.createPreference({
      orderId: order.id, // Referência Externa
      userEmail,
      items: mpItems
    });

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      // URL para redirecionar o usuário pro checkout do MP
      checkoutUrl: env.NODE_ENV === 'production' ? preference.init_point : preference.sandbox_init_point || preference.init_point
    };
  }
}
