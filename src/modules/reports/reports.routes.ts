import { Router } from 'express';
import { reportsController } from './reports.controller';
import { authMiddleware } from '../../shared/middlewares/auth.middleware';
import { requireRole } from '../../shared/middlewares/permission.middleware';

const router = Router();

router.use(authMiddleware);
router.use(requireRole('ADMIN', 'MANAGER'));

router.get('/movements', reportsController.movements);
router.get('/products', reportsController.products);
router.get('/low-stock', reportsController.lowStock);

export default router;
