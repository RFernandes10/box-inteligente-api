import { Request, Response, NextFunction } from 'express';
import { successResponse, paginatedResponse } from '../../../shared/utils/response';
import { CategoriesService } from '../application/categories.service';

export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  readonly list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const search = req.query.search as string;
      const result = await this.categoriesService.list(page, limit, search);
      return paginatedResponse(res, result.data, result.pagination);
    } catch (err) { next(err); }
  };

  readonly listAll = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const categories = await this.categoriesService.listAll();
      return successResponse(res, categories);
    } catch (err) { next(err); }
  };

  readonly create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const category = await this.categoriesService.create(req.body);
      return successResponse(res, category, 'Categoria criada com sucesso', 201);
    } catch (err) { next(err); }
  };

  readonly update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const category = await this.categoriesService.update(req.params.id as string, req.body);
      return successResponse(res, category, 'Categoria atualizada com sucesso');
    } catch (err) { next(err); }
  };

  readonly delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.categoriesService.delete(req.params.id as string);
      return successResponse(res, null, 'Categoria removida com sucesso');
    } catch (err) { next(err); }
  };
}