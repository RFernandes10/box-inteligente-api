import { Router } from 'express';
import { ReportsController } from './reports.controller';
import { authMiddleware } from '../../../shared/middlewares/auth.middleware';
import { requireRole } from '../../../shared/middlewares/permission.middleware';

export function createReportsRouter(controller: ReportsController): Router {
  const router = Router();

  router.use(authMiddleware);
  router.use(requireRole('ADMIN', 'MANAGER'));

  router.get('/movements', controller.movements);
  router.get('/products', controller.products);
  router.get('/low-stock', controller.lowStock);

  return router;
}