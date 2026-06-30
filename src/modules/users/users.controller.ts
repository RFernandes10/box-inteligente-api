import { Request, Response, NextFunction } from 'express';
import { usersService } from './users.service';
import { successResponse, paginatedResponse } from '../../shared/utils/response';

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
      return successResponse(res, user, 'Usuário criado com sucesso', 201);
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await usersService.update(req.params.id as string, req.body);
      return successResponse(res, user, 'Usuário atualizado com sucesso');
    } catch (err) {
      next(err);
    }
  }

  async toggleStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await usersService.toggleStatus(req.params.id as string);
      return successResponse(res, user, 'Status do usuário atualizado');
    } catch (err) {
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await usersService.delete(req.params.id as string);
      return successResponse(res, null, 'Usuário removido com sucesso');
    } catch (err) {
      next(err);
    }
  }
}

export const usersController = new UsersController();
