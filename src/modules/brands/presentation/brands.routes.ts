import { Router } from 'express';
import { BrandsController } from './brands.controller';
import { authMiddleware } from '../../../shared/middlewares/auth.middleware';
import { requireRole } from '../../../shared/middlewares/permission.middleware';
import { validate } from '../../../shared/validators';
import { z } from 'zod';

const createBrandSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Nome é obrigatório'),
    description: z.string().optional(),
    logoUrl: z.string().url().optional(),
  }),
});

const updateBrandSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    logoUrl: z.string().url().optional(),
  }),
  params: z.object({ id: z.string().uuid() }),
});

export function createBrandsRouter(controller: BrandsController): Router {
  const router = Router();

  router.get('/', authMiddleware, controller.list);
  router.get('/all', authMiddleware, controller.listAll);
  router.post('/', authMiddleware, requireRole('ADMIN', 'MANAGER'), validate(createBrandSchema), controller.create);
  router.put('/:id', authMiddleware, requireRole('ADMIN', 'MANAGER'), validate(updateBrandSchema), controller.update);
  router.delete('/:id', authMiddleware, requireRole('ADMIN'), controller.delete);

  return router;
}