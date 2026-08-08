import { prisma } from '../../../config/database';
import { LowStockReportRow, MovementReportRow, ProductReportRow, ReportsRepository } from '../domain/reports.repository';

export class PrismaReportsRepository implements ReportsRepository {
  async getMovementsReport(filters: Record<string, unknown>): Promise<MovementReportRow[]> {
    const where: Record<string, unknown> = {};
    if (filters.type) where.type = filters.type;
    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) (where.createdAt as Record<string, unknown>).gte = new Date(filters.startDate as string);
      if (filters.endDate) (where.createdAt as Record<string, unknown>).lte = new Date(filters.endDate as string);
    }

    return prisma.stockMovement.findMany({
      where,
      include: {
        product: { select: { name: true, internalCode: true } },
        user: { select: { name: true } },
        supplier: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    }) as Promise<MovementReportRow[]>;
  }

  async getProductsReport(): Promise<ProductReportRow[]> {
    const products = await prisma.product.findMany({
      where: { deletedAt: null },
      include: {
        brand: { select: { name: true } },
        category: { select: { name: true } },
        supplier: { select: { name: true } },
      },
      orderBy: { name: 'asc' },
    });

    return products.map((p) => ({
      id: p.id,
      internalCode: p.internalCode,
      name: p.name,
      costPrice: Number(p.costPrice),
      salePrice: Number(p.salePrice),
      currentStock: p.currentStock,
      minStock: p.minStock,
      brand: p.brand,
      category: p.category,
      supplier: p.supplier,
    }));
  }

  async getLowStockReport(): Promise<LowStockReportRow[]> {
    return prisma.$queryRaw`
      SELECT p.name, p.internal_code as "internalCode", p.current_stock as "currentStock",
             p.min_stock as "minStock", p.sale_price as "salePrice",
             b.name as brand_name, c.name as category_name
      FROM products p
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.deleted_at IS NULL AND p.active = true AND p.current_stock <= p.min_stock
      ORDER BY p.current_stock ASC
    `;
  }
}