import { MovementType } from '@prisma/client';
import { prisma } from '../../../config/database';
import { AppError } from '../../../shared/errors/AppError';
import { StockMovementRepository } from '../domain/stock-movement.repository';
import { PaginatedResult, RegisterMovementParams, StockMovementRecord } from '../domain/stock-movement.types';

export class PrismaStockMovementRepository implements StockMovementRepository {
  registerMovement(params: RegisterMovementParams): Promise<StockMovementRecord> {
    const { userId, type, data, ipAddress } = params;

    if (data.quantity <= 0) {
      throw new AppError('Quantidade deve ser maior que zero', 400, 'INVALID_QUANTITY');
    }

    return prisma.$transaction(async (tx) => {
      const locked = await tx.$queryRaw<Array<{ current_stock: number }>>`
        SELECT current_stock FROM products
        WHERE id = ${data.productId} AND deleted_at IS NULL
        FOR UPDATE
      `;
      if (!locked.length) {
        throw new AppError('Produto não encontrado', 404, 'PRODUCT_NOT_FOUND');
      }

      if (type === 'EXIT' && locked[0].current_stock < data.quantity) {
        throw new AppError('Estoque insuficiente para realizar esta saída', 400, 'INSUFFICIENT_STOCK');
      }

      const previousStock = locked[0].current_stock;
      const newStock = type === 'ENTRY' ? previousStock + data.quantity : previousStock - data.quantity;

      const mov = await tx.stockMovement.create({
        data: {
          productId: data.productId,
          userId,
          supplierId: data.supplierId,
          type: type as MovementType,
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

      return mov as unknown as StockMovementRecord;
    });
  }

  async list(
    page: number,
    limit: number,
    filters: Record<string, unknown> = {}
  ): Promise<PaginatedResult<StockMovementRecord>> {
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

    return {
      data: movements as StockMovementRecord[],
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async listByProduct(
    productId: string,
    page: number,
    limit: number
  ): Promise<PaginatedResult<StockMovementRecord>> {
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

    return {
      data: movements as StockMovementRecord[],
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  clear(): Promise<number> {
    return prisma.stockMovement.deleteMany({}).then((r) => r.count);
  }
}