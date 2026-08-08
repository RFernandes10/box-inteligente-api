import { Request, Response, NextFunction } from 'express';
import { successResponse, paginatedResponse } from '../../../shared/utils/response';
import { hashIP } from '../../../shared/utils/ipHash';
import { auditService } from '../../../shared/services/audit.service';
import { AppError } from '../../../shared/errors/AppError';
import { StockMovementsService } from '../application/stock-movements.service';

function getUserId(req: Request): string {
  if (!req.user) throw new AppError('Usuário não autenticado', 401, 'UNAUTHORIZED');
  return req.user.id;
}

export class StockMovementsController {
  constructor(private readonly stockMovementsService: StockMovementsService) {}

  readonly entry = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = getUserId(req);
      const ipAddress = hashIP(req.ip || (req.headers['x-forwarded-for'] as string));
      const movement = await this.stockMovementsService.registerEntry(userId, req.body, ipAddress);
      return successResponse(res, movement, 'Entrada registrada com sucesso', 201);
    } catch (err) { next(err); }
  };

  readonly exit = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = getUserId(req);
      const ipAddress = hashIP(req.ip || (req.headers['x-forwarded-for'] as string));
      const movement = await this.stockMovementsService.registerExit(userId, req.body, ipAddress);
      return successResponse(res, movement, 'Saída registrada com sucesso', 201);
    } catch (err) { next(err); }
  };

  readonly list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const filters: Record<string, unknown> = {};
      if (req.query.type) filters.type = req.query.type;
      if (req.query.productId) filters.productId = req.query.productId;
      if (req.query.userId) filters.userId = req.query.userId;
      if (req.query.startDate) filters.startDate = req.query.startDate;
      if (req.query.endDate) filters.endDate = req.query.endDate;

      const result = await this.stockMovementsService.list(page, limit, filters);
      return paginatedResponse(res, result.data, result.pagination);
    } catch (err) { next(err); }
  };

  readonly listByProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const result = await this.stockMovementsService.listByProduct(req.params.productId as string, page, limit);
      return paginatedResponse(res, result.data, result.pagination);
    } catch (err) { next(err); }
  };

  readonly clear = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const count = await this.stockMovementsService.clear();
      auditService.log({
        userId: req.user?.id,
        action: 'MOVEMENTS_CLEARED',
        entity: 'StockMovement',
        details: { deletedCount: count },
        ipAddress: req.ip || (req.headers['x-forwarded-for'] as string),
      });
      return successResponse(res, { deletedCount: count }, 'Histórico de movimentações limpo');
    } catch (err) { next(err); }
  };
}