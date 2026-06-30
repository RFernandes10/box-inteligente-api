import { Router } from 'express';
import { brandsController } from './brands.controller';
import { authMiddleware } from '../../shared/middlewares/auth.middleware';
import { requireRole } from '../../shared/middlewares/permission.middleware';
import { validate } from '../../shared/validators';
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

const router = Router();

router.get('/', authMiddleware, brandsController.list);
router.get('/all', authMiddleware, brandsController.listAll);
router.post('/', authMiddleware, requireRole('ADMIN', 'MANAGER'), validate(createBrandSchema), brandsController.create);
router.put('/:id', authMiddleware, requireRole('ADMIN', 'MANAGER'), validate(updateBrandSchema), brandsController.update);
router.delete('/:id', authMiddleware, requireRole('ADMIN'), brandsController.delete);

export default router;
