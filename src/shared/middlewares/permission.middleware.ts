import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';

type UserRole = 'ADMIN' | 'MANAGER' | 'STOCKIST';

export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('Usuário não autenticado', 401, 'NOT_AUTHENTICATED');
    }

    if (!roles.includes(req.user.role as UserRole)) {
      throw new AppError('Você não tem permissão para realizar esta ação', 403, 'FORBIDDEN');
    }

    next();
  };
}
