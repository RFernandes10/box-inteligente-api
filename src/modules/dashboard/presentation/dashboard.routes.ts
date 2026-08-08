import { Router } from 'express';
import { DashboardController } from './dashboard.controller';
import { authMiddleware } from '../../../shared/middlewares/auth.middleware';
import { requireRole } from '../../../shared/middlewares/permission.middleware';

export function createDashboardRouter(controller: DashboardController): Router {
  const router = Router();

  router.use(authMiddleware);
  router.use(requireRole('ADMIN', 'MANAGER'));

  router.get('/summary', controller.summary);
  router.get('/movements-chart', controller.movementsChart);
  router.get('/low-stock', controller.lowStock);
  router.get('/top-products', controller.topProducts);
  router.get('/expiring-soon', controller.expiringSoon);

  return router;
}