import { Router } from 'express';
import { CategoriesController } from './categories.controller';
import { authMiddleware } from '../../../shared/middlewares/auth.middleware';
import { requireRole } from '../../../shared/middlewares/permission.middleware';
import { validate } from '../../../shared/validators';
import { z } from 'zod';

const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Nome é obrigatório'),
    description: z.string().optional(),
  }),
});

const updateCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
  }),
  params: z.object({ id: z.string().uuid() }),
});

export function createCategoriesRouter(controller: CategoriesController): Router {
  const router = Router();

  router.get('/', authMiddleware, controller.list);
  router.get('/all', authMiddleware, controller.listAll);
  router.post('/', authMiddleware, requireRole('ADMIN', 'MANAGER'), validate(createCategorySchema), controller.create);
  router.put('/:id', authMiddleware, requireRole('ADMIN', 'MANAGER'), validate(updateCategorySchema), controller.update);
  router.delete('/:id', authMiddleware, requireRole('ADMIN'), controller.delete);

  return router;
}