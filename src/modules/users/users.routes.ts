import { Router } from 'express';
import { usersController } from './users.controller';
import { authMiddleware } from '../../shared/middlewares/auth.middleware';
import { requireRole } from '../../shared/middlewares/permission.middleware';
import { validate } from '../../shared/validators';
import { z } from 'zod';

const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
    role: z.enum(['ADMIN', 'MANAGER', 'STOCKIST']).optional(),
  }),
});

const updateUserSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    email: z.string().email().optional(),
    password: z.string().min(6).optional(),
    role: z.enum(['ADMIN', 'MANAGER', 'STOCKIST']).optional(),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
});

const router = Router();

router.use(authMiddleware);
router.use(requireRole('ADMIN'));

router.get('/', usersController.list);
router.post('/', validate(createUserSchema), usersController.create);
router.put('/:id', validate(updateUserSchema), usersController.update);
router.patch('/:id/status', usersController.toggleStatus);
router.delete('/:id', usersController.delete);

export default router;
