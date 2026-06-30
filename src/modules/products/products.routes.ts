import { Router } from 'express';
import { productsController } from './products.controller';
import { authMiddleware } from '../../shared/middlewares/auth.middleware';
import { requireRole } from '../../shared/middlewares/permission.middleware';
import { upload } from '../../shared/middlewares/upload.middleware';

const router = Router();

router.get('/search', authMiddleware, productsController.search);
router.get('/', authMiddleware, productsController.list);
router.get('/:id', authMiddleware, productsController.getById);
router.post('/', authMiddleware, requireRole('ADMIN', 'MANAGER'), upload.single('image'), productsController.create);
router.put('/:id', authMiddleware, requireRole('ADMIN', 'MANAGER'), upload.single('image'), productsController.update);
router.patch('/:id/image', authMiddleware, requireRole('ADMIN', 'MANAGER'), upload.single('image'), productsController.updateImage);
router.delete('/:id', authMiddleware, requireRole('ADMIN'), productsController.delete);

export default router;
