import { Router } from 'express';
import { StockMovementsController } from './stock-movements.controller';
import { authMiddleware } from '../../../shared/middlewares/auth.middleware';
import { requireRole } from '../../../shared/middlewares/permission.middleware';
import { validate } from '../../../shared/validators';
import { z } from 'zod';

const entrySchema = z.object({
  body: z.object({
    productId: z.string().uuid('ID do produto inválido'),
    supplierId: z.string().uuid().optional(),
    quantity: z.number().int().positive('Quantidade deve ser maior que zero'),
    documentNumber: z.string().optional(),
    reason: z.string().optional(),
    destination: z.string().optional(),
    observations: z.string().optional(),
  }),
});

const exitSchema = z.object({
  body: z.object({
    productId: z.string().uuid('ID do produto inválido'),
    quantity: z.number().int().positive('Quantidade deve ser maior que zero'),
    documentNumber: z.string().optional(),
    reason: z.string().optional(),
    destination: z.string().optional(),
    observations: z.string().optional(),
  }),
});

export function createStockMovementsRouter(controller: StockMovementsController): Router {
  const router = Router();

  router.use(authMiddleware);

  router.post('/entry', requireRole('ADMIN', 'MANAGER', 'STOCKIST'), validate(entrySchema), controller.entry);
  router.post('/exit', requireRole('ADMIN', 'MANAGER', 'STOCKIST'), validate(exitSchema), controller.exit);
  router.get('/', requireRole('ADMIN', 'MANAGER'), controller.list);
  router.get('/product/:productId', requireRole('ADMIN', 'MANAGER'), controller.listByProduct);
  router.delete('/', requireRole('ADMIN', 'MANAGER'), controller.clear);

  return router;
}