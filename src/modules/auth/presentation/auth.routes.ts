import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { AuthController } from './auth.controller';
import { authMiddleware } from '../../../shared/middlewares/auth.middleware';
import { validate } from '../../../shared/validators';
import { z } from 'zod';

const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(1, 'Senha é obrigatória'),
  }),
});

const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token é obrigatório').optional(),
  }),
});

const logoutSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token é obrigatório').optional(),
  }),
});

const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(6, 'Senha atual deve ter ao menos 6 caracteres'),
    newPassword: z.string().min(8, 'A nova senha deve ter ao menos 8 caracteres'),
  }),
});

const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  keyGenerator: (req) => req.body.email || req.ip || 'unknown',
  message: { success: false, error: 'Muitas tentativas de login. Aguarde 1 minuto.', code: 'LOGIN_RATE_LIMIT' },
  standardHeaders: true,
  legacyHeaders: false,
});

export function createAuthRouter(controller: AuthController): Router {
  const router = Router();

  router.post('/login', loginLimiter, validate(loginSchema), controller.login);
  router.post('/refresh', validate(refreshSchema), controller.refresh);
  router.post('/logout', validate(logoutSchema), controller.logout);
  router.post('/change-password', authMiddleware, validate(changePasswordSchema), controller.changePassword);

  return router;
}