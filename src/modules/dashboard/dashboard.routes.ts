import { Router } from 'express';
import { dashboardController } from './dashboard.controller';
import { authMiddleware } from '../../shared/middlewares/auth.middleware';
import { requireRole } from '../../shared/middlewares/permission.middleware';

const router = Router();

router.use(authMiddleware);
router.use(requireRole('ADMIN', 'MANAGER'));

router.get('/summary', dashboardController.summary);
router.get('/movements-chart', dashboardController.movementsChart);
router.get('/low-stock', dashboardController.lowStock);
router.get('/top-products', dashboardController.topProducts);
router.get('/expiring-soon', dashboardController.expiringSoon);

export default router;
