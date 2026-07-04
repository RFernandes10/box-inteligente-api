import { Request, Response, NextFunction } from 'express';
import { usersService } from './users.service';
import { successResponse, paginatedResponse } from '../../shared/utils/response';
import { auditService } from '../../shared/services/audit.service';
import { AppError } from '../../shared/errors/AppError';

export class UsersController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const result = await usersService.list(page, limit);
      return paginatedResponse(res, result.data, result.pagination);
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await usersService.create(req.body);
      auditService.log({
        userId: req.user?.id,
        action: 'USER_CREATED',
        entity: 'User',
        entityId: user.id,
        details: { email: user.email, role: user.role },
        ipAddress: req.ip || (req.headers['x-forwarded-for'] as string),
      });
      return successResponse(res, user, 'Usuário criado com sucesso', 201);
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await usersService.update(req.params.id as string, req.body);
      auditService.log({
        userId: req.user?.id,
        action: 'USER_UPDATED',
        entity: 'User',
        entityId: user.id,
        details: { changes: Object.keys(req.body) },
        ipAddress: req.ip || (req.headers['x-forwarded-for'] as string),
      });
      return successResponse(res, user, 'Usuário atualizado com sucesso');
    } catch (err) {
      next(err);
    }
  }

  async toggleStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const targetId = req.params.id as string;
      if (targetId === req.user?.id) {
        throw new AppError('Você não pode desativar sua própria conta', 403, 'SELF_DEACTIVATE');
      }
      const user = await usersService.toggleStatus(targetId);
      auditService.log({
        userId: req.user?.id,
        action: user.active ? 'USER_ACTIVATED' : 'USER_DEACTIVATED',
        entity: 'User',
        entityId: user.id,
        ipAddress: req.ip || (req.headers['x-forwarded-for'] as string),
      });
      return successResponse(res, user, 'Status do usuário atualizado');
    } catch (err) {
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const targetId = req.params.id as string;
      if (targetId === req.user?.id) {
        throw new AppError('Você não pode excluir sua própria conta', 403, 'SELF_DELETE');
      }
      await usersService.delete(targetId);
      auditService.log({
        userId: req.user?.id,
        action: 'USER_DELETED',
        entity: 'User',
        entityId: targetId,
        ipAddress: req.ip || (req.headers['x-forwarded-for'] as string),
      });
      return successResponse(res, null, 'Usuário removido com sucesso');
    } catch (err) {
      next(err);
    }
  }
}

export const usersController = new UsersController();
