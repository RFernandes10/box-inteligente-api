export type MovementType = 'ENTRY' | 'EXIT';

export interface MovementInput {
  productId: string;
  supplierId?: string;
  quantity: number;
  documentNumber?: string;
  reason?: string;
  destination?: string;
  observations?: string;
}

export interface RegisterMovementParams {
  userId: string;
  type: 'ENTRY' | 'EXIT';
  data: MovementInput;
  ipAddress?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface StockMovementRecord {
  id: string;
  type: MovementType;
  previousStock: number;
  newStock: number;
  quantity: number;
  productId: string;
  userId: string;
  supplierId?: string | null;
  createdAt: Date;
}