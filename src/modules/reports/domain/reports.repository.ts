export interface MovementReportRow {
  id: string;
  type: 'ENTRY' | 'EXIT';
  quantity: number;
  previousStock: number;
  newStock: number;
  createdAt: Date;
  product: { name: string; internalCode: string };
  user: { name: string };
  supplier?: { name: string } | null;
}

export interface ProductReportRow {
  id: string;
  internalCode: string;
  name: string;
  costPrice: number;
  salePrice: number;
  currentStock: number;
  minStock: number;
  brand?: { name: string } | null;
  category?: { name: string } | null;
  supplier?: { name: string } | null;
}

export interface LowStockReportRow {
  name: string;
  internalCode: string;
  currentStock: number;
  minStock: number;
  salePrice: number;
  brand_name?: string | null;
  category_name?: string | null;
}

export interface ReportsRepository {
  getMovementsReport(filters: Record<string, unknown>): Promise<MovementReportRow[]>;
  getProductsReport(): Promise<ProductReportRow[]>;
  getLowStockReport(): Promise<LowStockReportRow[]>;
}