import { Request, Response, NextFunction } from 'express';
import { dashboardService } from './dashboard.service';
import { successResponse } from '../../shared/utils/response';

export class DashboardController {
  async summary(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await dashboardService.getSummary();
      return successResponse(res, data);
    } catch (err) { next(err); }
  }

  async movementsChart(req: Request, res: Response, next: NextFunction) {
    try {
      const days = Number(req.query.days) || 30;
      const data = await dashboardService.getMovementsChart(days);
      return successResponse(res, data);
    } catch (err) { next(err); }
  }

  async lowStock(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await dashboardService.getLowStock();
      return successResponse(res, data);
    } catch (err) { next(err); }
  }

  async topProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = Number(req.query.limit) || 10;
      const data = await dashboardService.getTopProducts(limit);
      return successResponse(res, data);
    } catch (err) { next(err); }
  }

  async expiringSoon(req: Request, res: Response, next: NextFunction) {
    try {
      const days = Number(req.query.days) || 30;
      const data = await dashboardService.getExpiringSoon(days);
      return successResponse(res, data);
    } catch (err) { next(err); }
  }
}

export const dashboardController = new DashboardController();
