import { prisma } from '../../config/database';
import { AppError } from '../../shared/errors/AppError';
import { MovementType } from '@prisma/client';

interface MovementInput {
  productId: string;
  supplierId?: string;
  quantity: number;
  documentNumber?: string;
  reason?: string;
  destination?: string;
  observations?: string;
}

export class StockMovementsService {
  async registerEntry(userId: string, data: MovementInput, ipAddress?: string) {
    const product = await prisma.product.findFirst({ where: { id: data.productId, deletedAt: null } });
    if (!product) throw new AppError('Produto não encontrado', 404, 'PRODUCT_NOT_FOUND');

    if (data.quantity <= 0) throw new AppError('Quantidade deve ser maior que zero', 400, 'INVALID_QUANTITY');

    const previousStock = product.currentStock;
    const newStock = previousStock + data.quantity;

    const movement = await prisma.$transaction(async (tx) => {
      const mov = await tx.stockMovement.create({
        data: {
          productId: data.productId,
          userId,
          supplierId: data.supplierId,
          type: MovementType.ENTRY,
          quantity: data.quantity,
          previousStock,
          newStock,
          documentNumber: data.documentNumber,
          reason: data.reason,
          destination: data.destination,
          observations: data.observations,
          ipAddress,
        },
        include: {
          product: { select: { id: true, name: true, internalCode: true } },
          user: { select: { id: true, name: true } },
          supplier: { select: { id: true, name: true } },
        },
      });

      await tx.product.update({
        where: { id: data.productId },
        data: { currentStock: newStock },
      });

      return mov;
    });

    return movement;
  }

  async registerExit(userId: string, data: MovementInput, ipAddress?: string) {
    const product = await prisma.product.findFirst({ where: { id: data.productId, deletedAt: null } });
    if (!product) throw new AppError('Produto não encontrado', 404, 'PRODUCT_NOT_FOUND');

    if (data.quantity <= 0) throw new AppError('Quantidade deve ser maior que zero', 400, 'INVALID_QUANTITY');

    if (product.currentStock < data.quantity) {
      throw new AppError('Estoque insuficiente para realizar esta saída', 400, 'INSUFFICIENT_STOCK');
    }

    const previousStock = product.currentStock;
    const newStock = previousStock - data.quantity;

    const movement = await prisma.$transaction(async (tx) => {
      const mov = await tx.stockMovement.create({
        data: {
          productId: data.productId,
          userId,
          supplierId: data.supplierId,
          type: MovementType.EXIT,
          quantity: data.quantity,
          previousStock,
          newStock,
          documentNumber: data.documentNumber,
          reason: data.reason,
          destination: data.destination,
          observations: data.observations,
          ipAddress,
        },
        include: {
          product: { select: { id: true, name: true, internalCode: true } },
          user: { select: { id: true, name: true } },
        },
      });

      await tx.product.update({
        where: { id: data.productId },
        data: { currentStock: newStock },
      });

      return mov;
    });

    return movement;
  }

  async list(page = 1, limit = 20, filters: Record<string, unknown> = {}) {
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};

    if (filters.type) where.type = filters.type;
    if (filters.productId) where.productId = filters.productId;
    if (filters.userId) where.userId = filters.userId;
    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) (where.createdAt as Record<string, unknown>).gte = new Date(filters.startDate as string);
      if (filters.endDate) (where.createdAt as Record<string, unknown>).lte = new Date(filters.endDate as string);
    }

    const [movements, total] = await Promise.all([
      prisma.stockMovement.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          product: { select: { id: true, name: true, internalCode: true } },
          user: { select: { id: true, name: true } },
          supplier: { select: { id: true, name: true } },
        },
      }),
      prisma.stockMovement.count({ where }),
    ]);

    return { data: movements, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async listByProduct(productId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where = { productId };

    const [movements, total] = await Promise.all([
      prisma.stockMovement.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true } },
          supplier: { select: { id: true, name: true } },
        },
      }),
      prisma.stockMovement.count({ where }),
    ]);

    return { data: movements, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }
}

export const stockMovementsService = new StockMovementsService();
