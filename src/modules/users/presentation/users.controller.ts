import { Request, Response, NextFunction } from 'express';
import { successResponse, paginatedResponse } from '../../../shared/utils/response';
import { auditService } from '../../../shared/services/audit.service';
import { AppError } from '../../../shared/errors/AppError';
import { UsersService } from '../application/users.service';

export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  readonly list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const result = await this.usersService.list(page, limit);
      return paginatedResponse(res, result.data, result.pagination);
    } catch (err) {
      next(err);
    }
  };

  readonly create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this.usersService.create(req.body);
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
  };

  readonly update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this.usersService.update(req.params.id as string, req.body);
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
  };

  readonly toggleStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const targetId = req.params.id as string;
      if (targetId === req.user?.id) {
        throw new AppError('Você não pode desativar sua própria conta', 403, 'SELF_DEACTIVATE');
      }
      const user = await this.usersService.toggleStatus(targetId);
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
  };

  readonly delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const targetId = req.params.id as string;
      if (targetId === req.user?.id) {
        throw new AppError('Você não pode excluir sua própria conta', 403, 'SELF_DELETE');
      }
      await this.usersService.delete(targetId);
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
  };
}