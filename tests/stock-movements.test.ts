import { describe, it, expect, vi, beforeEach } from 'vitest';

const STOCK: { current: number; empty: boolean } = { current: 0, empty: false };

let txQueue = Promise.resolve();
const runSerialized = <T>(fn: () => Promise<T>): Promise<T> => {
  const run = txQueue.then(() => fn());
  txQueue = run.then(() => undefined, () => undefined);
  return run;
};

const buildTx = () => ({
  $queryRaw: vi.fn(async () =>
    STOCK.empty ? [] : [{ current_stock: STOCK.current }]
  ),
  stockMovement: {
    create: vi.fn(async ({ data }: { data: Record<string, unknown> }) => ({ id: '1', ...data })),
  },
  product: {
    update: vi.fn(async ({ data }: { data: { currentStock: number } }) => {
      STOCK.current = data.currentStock;
      return {};
    }),
  },
});

vi.mock('@/config/database', () => ({
  prisma: {
    stockMovement: {
      create: vi.fn(),
    },
    $transaction: vi.fn((fn: (tx: unknown) => Promise<unknown>) => runSerialized(() => fn(buildTx()))),
  },
}));

import { StockMovementsService } from '@/modules/stock-movements/stock-movements.service';
import { prisma } from '@/config/database';

describe('StockMovementService', () => {
  let service: StockMovementsService;

  beforeEach(() => {
    service = new StockMovementsService();
    vi.clearAllMocks();
    STOCK.current = 0;
    STOCK.empty = false;
    txQueue = Promise.resolve();
  });

  it('deve aumentar o estoque ao registrar entrada', async () => {
    STOCK.current = 10;
    const result = await service.registerEntry('user-1', {
      productId: 'prod-1',
      quantity: 5,
    });

    expect(result.newStock).toBe(15);
    expect(result.previousStock).toBe(10);
    expect(result.type).toBe('ENTRY');
  });

  it('deve diminuir o estoque ao registrar saída', async () => {
    STOCK.current = 20;
    const result = await service.registerExit('user-1', {
      productId: 'prod-1',
      quantity: 5,
    });

    expect(result.newStock).toBe(15);
    expect(result.previousStock).toBe(20);
    expect(result.type).toBe('EXIT');
  });

  it('deve lançar erro ao tentar saída maior que estoque atual', async () => {
    STOCK.current = 3;
    await expect(
      service.registerExit('user-1', { productId: 'prod-1', quantity: 10 })
    ).rejects.toThrow('Estoque insuficiente para realizar esta saída');
  });

  it('deve nunca resultar em estoque negativo', async () => {
    STOCK.current = 0;
    await expect(
      service.registerExit('user-1', { productId: 'prod-1', quantity: 1 })
    ).rejects.toThrow('Estoque insuficiente');
  });

  it('deve registrar saldo anterior e novo corretamente', async () => {
    STOCK.current = 100;
    const result = await service.registerEntry('user-1', {
      productId: 'prod-1',
      quantity: 50,
    });

    expect(result.previousStock).toBe(100);
    expect(result.newStock).toBe(150);
  });

  it('deve rejeitar quantidade zero ou negativa', async () => {
    STOCK.current = 10;
    await expect(
      service.registerEntry('user-1', { productId: 'prod-1', quantity: 0 })
    ).rejects.toThrow('Quantidade deve ser maior que zero');

    await expect(
      service.registerEntry('user-1', { productId: 'prod-1', quantity: -5 })
    ).rejects.toThrow('Quantidade deve ser maior que zero');
  });

  it('deve rejeitar produto inexistente', async () => {
    STOCK.empty = true;
    await expect(
      service.registerEntry('user-1', { productId: 'invalid-id', quantity: 5 })
    ).rejects.toThrow('Produto não encontrado');
  });

  it('deve bloquear venda concorrente (overselling) sob lock pessimista', async () => {
    STOCK.current = 6;

    const [first, second] = await Promise.all([
      service.registerExit('user-1', { productId: 'prod-1', quantity: 5 }),
      service.registerExit('user-1', { productId: 'prod-1', quantity: 5 }).catch((e) => e),
    ]);

    expect(first.newStock).toBe(1);
    expect(second).toBeInstanceOf(Error);
    expect((second as Error).message).toContain('Estoque insuficiente');
    expect(STOCK.current).toBe(1);
  });

  it('nunca permite que duas saídas concorrentes entrem no mesmo saldo', async () => {
    STOCK.current = 10;

    const results = await Promise.all([
      service.registerExit('user-1', { productId: 'prod-1', quantity: 7 }).catch((e) => e),
      service.registerExit('user-1', { productId: 'prod-1', quantity: 7 }).catch((e) => e),
    ]);

    const resolved = results.filter((r) => !(r instanceof Error));
    const rejected = results.filter((r) => r instanceof Error);

    expect(resolved).toHaveLength(1);
    expect(rejected).toHaveLength(1);
    expect(STOCK.current).toBe(3);
  });
});