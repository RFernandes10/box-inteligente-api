export interface DashboardSummary {
  totalProducts: number;
  inStock: number;
  noStock: number;
  lowStock: number;
  todayEntries: number;
  todayExits: number;
  totalStockValue: number;
}

export interface ChartEntry {
  date: string;
  total: number;
}

export interface MovementChart {
  entries: ChartEntry[];
  exits: ChartEntry[];
}

export interface LowStockProduct {
  id: string;
  name: string;
  internalCode: string;
  currentStock: number;
  minStock: number;
  maxStock?: number | null;
  imageUrl?: string | null;
  brand_name?: string | null;
  category_name?: string | null;
}

export interface TopProduct {
  id: string;
  name: string;
  internalCode: string;
  currentStock: number;
  imageUrl?: string | null;
  movement_count: number;
  total_entries: number;
  total_exits: number;
}

export interface ExpiringProduct {
  id: string;
  name: string;
  internalCode: string;
  currentStock: number;
  expirationDate: Date;
  imageUrl?: string | null;
  brand?: { name: string } | null;
  category?: { name: string } | null;
}

export interface DashboardRepository {
  getSummary(): Promise<DashboardSummary>;
  getMovementsChart(days: number): Promise<MovementChart>;
  getLowStock(): Promise<LowStockProduct[]>;
  getTopProducts(limit: number): Promise<TopProduct[]>;
  getExpiringSoon(days: number): Promise<ExpiringProduct[]>;
}