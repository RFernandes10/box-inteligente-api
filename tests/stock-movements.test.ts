import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../src/config/database', () => ({
  prisma: {
    product: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    stockMovement: {
      create: vi.fn(),
    },
    $transaction: vi.fn((fn: (tx: unknown) => Promise<unknown>) => fn({
      stockMovement: { create: vi.fn().mockResolvedValue({ id: '1', type: 'ENTRY', quantity: 10, previousStock: 5, newStock: 15 }) },
      product: { update: vi.fn() },
    })),
  },
}));

import { StockMovementsService } from '../../src/modules/stock-movements/stock-movements.service';
import { prisma } from '../../src/config/database';

describe('StockMovementService', () => {
  let service: StockMovementsService;

  beforeEach(() => {
    service = new StockMovementsService();
    vi.clearAllMocks();
  });

  it('deve aumentar o estoque ao registrar entrada', async () => {
    const mockProduct = { id: 'prod-1', currentStock: 10, deletedAt: null };
    vi.mocked(prisma.product.findFirst).mockResolvedValue(mockProduct as never);

    const result = await service.registerEntry('user-1', {
      productId: 'prod-1',
      quantity: 5,
    });

    expect(result.newStock).toBe(15);
    expect(result.previousStock).toBe(10);
    expect(result.type).toBe('ENTRY');
  });

  it('deve diminuir o estoque ao registrar saída', async () => {
    const mockProduct = { id: 'prod-1', currentStock: 20, deletedAt: null };
    vi.mocked(prisma.product.findFirst).mockResolvedValue(mockProduct as never);
    vi.mocked(prisma.$transaction).mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) => {
      return fn({
        stockMovement: { create: vi.fn().mockResolvedValue({ id: '1', type: 'EXIT', quantity: 5, previousStock: 20, newStock: 15 }) },
        product: { update: vi.fn() },
      });
    });

    const result = await service.registerExit('user-1', {
      productId: 'prod-1',
      quantity: 5,
    });

    expect(result.newStock).toBe(15);
    expect(result.previousStock).toBe(20);
    expect(result.type).toBe('EXIT');
  });

  it('deve lançar erro ao tentar saída maior que estoque atual', async () => {
    const mockProduct = { id: 'prod-1', currentStock: 3, deletedAt: null };
    vi.mocked(prisma.product.findFirst).mockResolvedValue(mockProduct as never);

    await expect(
      service.registerExit('user-1', { productId: 'prod-1', quantity: 10 })
    ).rejects.toThrow('Estoque insuficiente para realizar esta saída');
  });

  it('deve nunca resultar em estoque negativo', async () => {
    const mockProduct = { id: 'prod-1', currentStock: 0, deletedAt: null };
    vi.mocked(prisma.product.findFirst).mockResolvedValue(mockProduct as never);

    await expect(
      service.registerExit('user-1', { productId: 'prod-1', quantity: 1 })
    ).rejects.toThrow('Estoque insuficiente');
  });

  it('deve registrar saldo anterior e novo corretamente', async () => {
    const mockProduct = { id: 'prod-1', currentStock: 100, deletedAt: null };
    vi.mocked(prisma.product.findFirst).mockResolvedValue(mockProduct as never);

    const result = await service.registerEntry('user-1', {
      productId: 'prod-1',
      quantity: 50,
    });

    expect(result.previousStock).toBe(100);
    expect(result.newStock).toBe(150);
  });

  it('deve rejeitar quantidade zero ou negativa', async () => {
    const mockProduct = { id: 'prod-1', currentStock: 10, deletedAt: null };
    vi.mocked(prisma.product.findFirst).mockResolvedValue(mockProduct as never);

    await expect(
      service.registerEntry('user-1', { productId: 'prod-1', quantity: 0 })
    ).rejects.toThrow('Quantidade deve ser maior que zero');

    await expect(
      service.registerEntry('user-1', { productId: 'prod-1', quantity: -5 })
    ).rejects.toThrow('Quantidade deve ser maior que zero');
  });

  it('deve rejeitar produto inexistente', async () => {
    vi.mocked(prisma.product.findFirst).mockResolvedValue(null);

    await expect(
      service.registerEntry('user-1', { productId: 'invalid-id', quantity: 5 })
    ).rejects.toThrow('Produto não encontrado');
  });
});
