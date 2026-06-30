import { Request, Response, NextFunction } from 'express';
import { brandsService } from './brands.service';
import { successResponse, paginatedResponse } from '../../shared/utils/response';

export class BrandsController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const search = req.query.search as string;
      const result = await brandsService.list(page, limit, search);
      return paginatedResponse(res, result.data, result.pagination);
    } catch (err) {
      next(err);
    }
  }

  async listAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const brands = await brandsService.listAll();
      return successResponse(res, brands);
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const brand = await brandsService.create(req.body);
      return successResponse(res, brand, 'Marca criada com sucesso', 201);
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const brand = await brandsService.update(req.params.id as string, req.body);
      return successResponse(res, brand, 'Marca atualizada com sucesso');
    } catch (err) {
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await brandsService.delete(req.params.id as string);
      return successResponse(res, null, 'Marca removida com sucesso');
    } catch (err) {
      next(err);
    }
  }
}

export const brandsController = new BrandsController();
