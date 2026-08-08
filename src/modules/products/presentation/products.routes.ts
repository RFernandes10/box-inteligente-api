import { Router } from 'express';
import { ProductsController } from './products.controller';
import { authMiddleware } from '../../../shared/middlewares/auth.middleware';
import { requireRole } from '../../../shared/middlewares/permission.middleware';
import { upload } from '../../../shared/middlewares/upload.middleware';

export function createProductsRouter(controller: ProductsController): Router {
  const router = Router();

  router.get('/search', authMiddleware, controller.search);
  router.get('/', authMiddleware, controller.list);
  router.get('/:id', authMiddleware, controller.getById);
  router.post('/', authMiddleware, requireRole('ADMIN', 'MANAGER'), upload.single('image'), controller.create);
  router.put('/:id', authMiddleware, requireRole('ADMIN', 'MANAGER'), upload.single('image'), controller.update);
  router.patch('/:id/image', authMiddleware, requireRole('ADMIN', 'MANAGER'), upload.single('image'), controller.updateImage);
  router.delete('/:id', authMiddleware, requireRole('ADMIN'), controller.delete);

  return router;
}