import { StockMovementRepository } from '../domain/stock-movement.repository';
import { MovementInput, PaginatedResult, StockMovementRecord } from '../domain/stock-movement.types';

export class StockMovementsService {
  constructor(private readonly repository: StockMovementRepository) {}

  registerEntry(userId: string, data: MovementInput, ipAddress?: string): Promise<StockMovementRecord> {
    return this.repository.registerMovement({ userId, type: 'ENTRY', data, ipAddress });
  }

  registerExit(userId: string, data: MovementInput, ipAddress?: string): Promise<StockMovementRecord> {
    return this.repository.registerMovement({ userId, type: 'EXIT', data, ipAddress });
  }

  list(page: number, limit: number, filters: Record<string, unknown> = {}): Promise<PaginatedResult<StockMovementRecord>> {
    return this.repository.list(page, limit, filters);
  }

  listByProduct(productId: string, page: number, limit: number): Promise<PaginatedResult<StockMovementRecord>> {
    return this.repository.listByProduct(productId, page, limit);
  }

  clear(): Promise<number> {
    return this.repository.clear();
  }
}