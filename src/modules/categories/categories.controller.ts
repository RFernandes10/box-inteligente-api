import { Request, Response, NextFunction } from 'express';
import { categoriesService } from './categories.service';
import { successResponse, paginatedResponse } from '../../shared/utils/response';

export class CategoriesController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const search = req.query.search as string;
      const result = await categoriesService.list(page, limit, search);
      return paginatedResponse(res, result.data, result.pagination);
    } catch (err) { next(err); }
  }

  async listAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await categoriesService.listAll();
      return successResponse(res, categories);
    } catch (err) { next(err); }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await categoriesService.create(req.body);
      return successResponse(res, category, 'Categoria criada com sucesso', 201);
    } catch (err) { next(err); }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await categoriesService.update(req.params.id as string, req.body);
      return successResponse(res, category, 'Categoria atualizada com sucesso');
    } catch (err) { next(err); }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await categoriesService.delete(req.params.id as string);
      return successResponse(res, null, 'Categoria removida com sucesso');
    } catch (err) { next(err); }
  }
}

export const categoriesController = new CategoriesController();
