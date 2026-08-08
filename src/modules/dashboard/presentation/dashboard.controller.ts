import { Request, Response, NextFunction } from 'express';
import { successResponse } from '../../../shared/utils/response';
import { DashboardService } from '../application/dashboard.service';

export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  readonly summary = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.dashboardService.getSummary();
      return successResponse(res, data);
    } catch (err) { next(err); }
  };

  readonly movementsChart = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const days = Number(req.query.days) || 30;
      const data = await this.dashboardService.getMovementsChart(days);
      return successResponse(res, data);
    } catch (err) { next(err); }
  };

  readonly lowStock = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.dashboardService.getLowStock();
      return successResponse(res, data);
    } catch (err) { next(err); }
  };

  readonly topProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const limit = Number(req.query.limit) || 10;
      const data = await this.dashboardService.getTopProducts(limit);
      return successResponse(res, data);
    } catch (err) { next(err); }
  };

  readonly expiringSoon = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const days = Number(req.query.days) || 30;
      const data = await this.dashboardService.getExpiringSoon(days);
      return successResponse(res, data);
    } catch (err) { next(err); }
  };
}