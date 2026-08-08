import { Router } from 'express';
import { SuppliersController } from './suppliers.controller';
import { authMiddleware } from '../../../shared/middlewares/auth.middleware';
import { requireRole } from '../../../shared/middlewares/permission.middleware';
import { validate } from '../../../shared/validators';
import { z } from 'zod';

const createSupplierSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Nome é obrigatório'),
    cnpj: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    responsible: z.string().optional(),
  }),
});

const updateSupplierSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    cnpj: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    responsible: z.string().optional(),
  }),
  params: z.object({ id: z.string().uuid() }),
});

export function createSuppliersRouter(controller: SuppliersController): Router {
  const router = Router();

  router.get('/', authMiddleware, controller.list);
  router.get('/all', authMiddleware, controller.listAll);
  router.post('/', authMiddleware, requireRole('ADMIN', 'MANAGER'), validate(createSupplierSchema), controller.create);
  router.put('/:id', authMiddleware, requireRole('ADMIN', 'MANAGER'), validate(updateSupplierSchema), controller.update);
  router.delete('/:id', authMiddleware, requireRole('ADMIN'), controller.delete);

  return router;
}