import { Request, Response, NextFunction } from 'express';
import { successResponse, paginatedResponse } from '../../../shared/utils/response';
import { BrandsService } from '../application/brands.service';

export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  readonly list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const search = req.query.search as string;
      const result = await this.brandsService.list(page, limit, search);
      return paginatedResponse(res, result.data, result.pagination);
    } catch (err) {
      next(err);
    }
  };

  readonly listAll = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const brands = await this.brandsService.listAll();
      return successResponse(res, brands);
    } catch (err) {
      next(err);
    }
  };

  readonly create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const brand = await this.brandsService.create(req.body);
      return successResponse(res, brand, 'Marca criada com sucesso', 201);
    } catch (err) {
      next(err);
    }
  };

  readonly update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const brand = await this.brandsService.update(req.params.id as string, req.body);
      return successResponse(res, brand, 'Marca atualizada com sucesso');
    } catch (err) {
      next(err);
    }
  };

  readonly delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.brandsService.delete(req.params.id as string);
      return successResponse(res, null, 'Marca removida com sucesso');
    } catch (err) {
      next(err);
    }
  };
}