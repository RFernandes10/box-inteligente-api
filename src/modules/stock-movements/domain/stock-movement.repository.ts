import { PaginatedResult, RegisterMovementParams, StockMovementRecord } from './stock-movement.types';

export interface StockMovementRepository {
  registerMovement(params: RegisterMovementParams): Promise<StockMovementRecord>;
  list(page: number, limit: number, filters: Record<string, unknown>): Promise<PaginatedResult<StockMovementRecord>>;
  listByProduct(productId: string, page: number, limit: number): Promise<PaginatedResult<StockMovementRecord>>;
  clear(): Promise<number>;
}