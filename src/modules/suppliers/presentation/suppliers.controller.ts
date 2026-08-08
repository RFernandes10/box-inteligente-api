import { Request, Response, NextFunction } from 'express';
import { successResponse, paginatedResponse } from '../../../shared/utils/response';
import { SuppliersService } from '../application/suppliers.service';

export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  readonly list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const search = req.query.search as string;
      const result = await this.suppliersService.list(page, limit, search);
      return paginatedResponse(res, result.data, result.pagination);
    } catch (err) { next(err); }
  };

  readonly listAll = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const suppliers = await this.suppliersService.listAll();
      return successResponse(res, suppliers);
    } catch (err) { next(err); }
  };

  readonly create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const supplier = await this.suppliersService.create(req.body);
      return successResponse(res, supplier, 'Fornecedor criado com sucesso', 201);
    } catch (err) { next(err); }
  };

  readonly update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const supplier = await this.suppliersService.update(req.params.id as string, req.body);
      return successResponse(res, supplier, 'Fornecedor atualizado com sucesso');
    } catch (err) { next(err); }
  };

  readonly delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.suppliersService.delete(req.params.id as string);
      return successResponse(res, null, 'Fornecedor removido com sucesso');
    } catch (err) { next(err); }
  };
}