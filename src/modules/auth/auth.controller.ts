import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { successResponse } from '../../shared/utils/response';
import { auditService } from '../../shared/services/audit.service';

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const ipAddress = req.ip || (req.headers['x-forwarded-for'] as string);
      const result = await authService.login({ email, password });
      auditService.log({
        userId: result.user.id,
        action: 'LOGIN_SUCCESS',
        entity: 'User',
        entityId: result.user.id,
        ipAddress,
      });
      return successResponse(res, result, 'Login realizado com sucesso');
    } catch (err: unknown) {
      const error = err as { statusCode?: number };
      if (error?.statusCode === 401 || error?.statusCode === 403) {
        auditService.log({
          action: 'LOGIN_FAILURE',
          entity: 'User',
          details: { email: req.body.email, reason: (err as Error).message },
          ipAddress: req.ip || (req.headers['x-forwarded-for'] as string),
        });
      }
      next(err);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refresh(refreshToken);
      return successResponse(res, result, 'Token renovado com sucesso');
    } catch (err) {
      next(err);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      await authService.logout(refreshToken);
      return successResponse(res, null, 'Logout realizado com sucesso');
    } catch (err) {
      next(err);
    }
  }
}

export const authController = new AuthController();
