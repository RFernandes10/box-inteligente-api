import { prisma } from '../../config/database';

export class DashboardService {
  async getSummary() {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [totalProducts, inStock, noStock, todayEntries, todayExits, lowStockCount, totalStockValue] = await Promise.all([
      prisma.product.count({ where: { deletedAt: null, active: true } }),
      prisma.product.count({ where: { deletedAt: null, active: true, currentStock: { gt: 0 } } }),
      prisma.product.count({ where: { deletedAt: null, active: true, currentStock: 0 } }),
      prisma.stockMovement.aggregate({
        where: { type: 'ENTRY', createdAt: { gte: startOfDay } },
        _sum: { quantity: true },
      }),
      prisma.stockMovement.aggregate({
        where: { type: 'EXIT', createdAt: { gte: startOfDay } },
        _sum: { quantity: true },
      }),
      prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(*) as count FROM products
        WHERE deleted_at IS NULL AND active = true AND current_stock > 0 AND current_stock <= min_stock
      `,
      prisma.$queryRaw<[{ total: number }]>`SELECT COALESCE(SUM(current_stock * cost_price), 0) as total FROM products WHERE deleted_at IS NULL AND active = true`,
    ]);

    return {
      totalProducts,
      inStock,
      lowStock: Number(lowStockCount[0].count),
      noStock,
      todayEntries: todayEntries._sum.quantity || 0,
      todayExits: todayExits._sum.quantity || 0,
      totalStockValue: Number(totalStockValue[0]?.total || 0),
    };
  }

  async getMovementsChart(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const entries = await prisma.$queryRaw<Array<{ date: string; total: bigint }>>`
      SELECT DATE(created_at) as date, SUM(quantity) as total
      FROM stock_movements
      WHERE type = 'ENTRY' AND created_at >= ${startDate}
      GROUP BY DATE(created_at)
      ORDER BY date
    `;

    const exits = await prisma.$queryRaw<Array<{ date: string; total: bigint }>>`
      SELECT DATE(created_at) as date, SUM(quantity) as total
      FROM stock_movements
      WHERE type = 'EXIT' AND created_at >= ${startDate}
      GROUP BY DATE(created_at)
      ORDER BY date
    `;

    return {
      entries: entries.map((e) => ({ date: e.date, total: Number(e.total) })),
      exits: exits.map((e) => ({ date: e.date, total: Number(e.total) })),
    };
  }

  async getLowStock() {
    return prisma.$queryRaw`
      SELECT p.id, p.name, p.internal_code as "internalCode", p.current_stock as "currentStock",
             p.min_stock as "minStock", p.max_stock as "maxStock", p.image_url as "imageUrl",
             b.name as brand_name, c.name as category_name
      FROM products p
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.deleted_at IS NULL AND p.active = true
        AND p.current_stock <= p.min_stock
      ORDER BY (p.current_stock::float / NULLIF(p.min_stock, 0)) ASC
      LIMIT 20
    `;
  }

  async getTopProducts(limit = 10) {
    return prisma.$queryRaw`
      SELECT p.id, p.name, p.internal_code as "internalCode", p.current_stock as "currentStock",
             p.image_url as "imageUrl", COUNT(sm.id) as movement_count,
             SUM(CASE WHEN sm.type = 'ENTRY' THEN sm.quantity ELSE 0 END) as total_entries,
             SUM(CASE WHEN sm.type = 'EXIT' THEN sm.quantity ELSE 0 END) as total_exits
      FROM products p
      LEFT JOIN stock_movements sm ON p.id = sm.product_id
      WHERE p.deleted_at IS NULL AND p.active = true
      GROUP BY p.id, p.name, p.internal_code, p.current_stock, p.image_url
      ORDER BY movement_count DESC
      LIMIT ${limit}
    `;
  }

  async getExpiringSoon(days = 30) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return prisma.product.findMany({
      where: {
        deletedAt: null,
        active: true,
        expirationDate: {
          not: null,
          lte: futureDate,
          gte: new Date(),
        },
      },
      select: {
        id: true,
        name: true,
        internalCode: true,
        currentStock: true,
        expirationDate: true,
        imageUrl: true,
        brand: { select: { name: true } },
        category: { select: { name: true } },
      },
      orderBy: { expirationDate: 'asc' },
      take: 20,
    });
  }
}

export const dashboardService = new DashboardService();
