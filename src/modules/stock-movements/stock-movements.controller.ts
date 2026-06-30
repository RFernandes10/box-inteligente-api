import { Request, Response, NextFunction } from 'express';
import { stockMovementsService } from './stock-movements.service';
import { successResponse, paginatedResponse } from '../../shared/utils/response';

export class StockMovementsController {
  async entry(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const ipAddress = req.ip || (req.headers['x-forwarded-for'] as string);
      const movement = await stockMovementsService.registerEntry(userId, req.body, ipAddress);
      return successResponse(res, movement, 'Entrada registrada com sucesso', 201);
    } catch (err) { next(err); }
  }

  async exit(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const ipAddress = req.ip || (req.headers['x-forwarded-for'] as string);
      const movement = await stockMovementsService.registerExit(userId, req.body, ipAddress);
      return successResponse(res, movement, 'Saída registrada com sucesso', 201);
    } catch (err) { next(err); }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const filters: Record<string, unknown> = {};
      if (req.query.type) filters.type = req.query.type;
      if (req.query.productId) filters.productId = req.query.productId;
      if (req.query.userId) filters.userId = req.query.userId;
      if (req.query.startDate) filters.startDate = req.query.startDate;
      if (req.query.endDate) filters.endDate = req.query.endDate;

      const result = await stockMovementsService.list(page, limit, filters);
      return paginatedResponse(res, result.data, result.pagination);
    } catch (err) { next(err); }
  }

  async listByProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const result = await stockMovementsService.listByProduct(req.params.productId as string, page, limit);
      return paginatedResponse(res, result.data, result.pagination);
    } catch (err) { next(err); }
  }
}

export const stockMovementsController = new StockMovementsController();
