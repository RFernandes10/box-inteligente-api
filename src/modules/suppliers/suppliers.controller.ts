import { Request, Response, NextFunction } from 'express';
import { suppliersService } from './suppliers.service';
import { successResponse, paginatedResponse } from '../../shared/utils/response';

export class SuppliersController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const search = req.query.search as string;
      const result = await suppliersService.list(page, limit, search);
      return paginatedResponse(res, result.data, result.pagination);
    } catch (err) { next(err); }
  }

  async listAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const suppliers = await suppliersService.listAll();
      return successResponse(res, suppliers);
    } catch (err) { next(err); }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const supplier = await suppliersService.create(req.body);
      return successResponse(res, supplier, 'Fornecedor criado com sucesso', 201);
    } catch (err) { next(err); }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const supplier = await suppliersService.update(req.params.id as string, req.body);
      return successResponse(res, supplier, 'Fornecedor atualizado com sucesso');
    } catch (err) { next(err); }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await suppliersService.delete(req.params.id as string);
      return successResponse(res, null, 'Fornecedor removido com sucesso');
    } catch (err) { next(err); }
  }
}

export const suppliersController = new SuppliersController();
