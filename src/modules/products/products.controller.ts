import { Request, Response, NextFunction } from 'express';
import { productsService, CreateProductInput } from './products.service';
import { successResponse, paginatedResponse } from '../../shared/utils/response';
import { auditService } from '../../shared/services/audit.service';

function parseProductBody(body: Record<string, unknown>) {
  const parsed: Record<string, unknown> = { ...body };
  if (body.costPrice !== undefined && body.costPrice !== '') parsed.costPrice = Number(body.costPrice);
  if (body.salePrice !== undefined && body.salePrice !== '') parsed.salePrice = Number(body.salePrice);
  if (body.weight !== undefined && body.weight !== '') parsed.weight = Number(body.weight);
  if (body.minStock !== undefined && body.minStock !== '') parsed.minStock = Number(body.minStock);
  if (body.maxStock !== undefined && body.maxStock !== '') parsed.maxStock = Number(body.maxStock);
  if (!body.supplierId || body.supplierId === '') parsed.supplierId = undefined;
  return parsed;
}

function sanitizeProduct(product: Record<string, unknown>, role?: string): Record<string, unknown> {
  if (role === 'STOCKIST') {
    const { costPrice, supplier, ...rest } = product;
    return rest;
  }
  return product;
}

function sanitizeProducts(products: unknown[], role?: string): unknown[] {
  return products.map((p) => sanitizeProduct(p as Record<string, unknown>, role));
}

export class ProductsController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const filters: Record<string, unknown> = {};
      if (req.query.search) filters.search = req.query.search;
      if (req.query.brandId) filters.brandId = req.query.brandId;
      if (req.query.categoryId) filters.categoryId = req.query.categoryId;
      if (req.query.supplierId) filters.supplierId = req.query.supplierId;
      if (req.query.active !== undefined) filters.active = req.query.active === 'true';
      const result = await productsService.list(page, limit, filters);
      return paginatedResponse(res, sanitizeProducts(result.data, req.user?.role), result.pagination);
    } catch (err) { next(err); }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await productsService.getById(req.params.id as string);
      return successResponse(res, sanitizeProduct(product, req.user?.role));
    } catch (err) { next(err); }
  }

  async search(req: Request, res: Response, next: NextFunction) {
    try {
      const q = req.query.q as string;
      const products = await productsService.search(q);
      return successResponse(res, sanitizeProducts(products, req.user?.role));
    } catch (err) { next(err); }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = parseProductBody(req.body) as unknown as CreateProductInput;
      const product = await productsService.create(data, req.file);
      auditService.log({
        userId: req.user?.id,
        action: 'PRODUCT_CREATED',
        entity: 'Product',
        entityId: product.id,
        details: { name: product.name, internalCode: product.internalCode },
        ipAddress: req.ip || (req.headers['x-forwarded-for'] as string),
      });
      return successResponse(res, product, 'Produto criado com sucesso', 201);
    } catch (err) { next(err); }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = parseProductBody(req.body) as unknown as CreateProductInput;
      const product = await productsService.update(req.params.id as string, data, req.file);
      auditService.log({
        userId: req.user?.id,
        action: 'PRODUCT_UPDATED',
        entity: 'Product',
        entityId: product.id,
        ipAddress: req.ip || (req.headers['x-forwarded-for'] as string),
      });
      return successResponse(res, product, 'Produto atualizado com sucesso');
    } catch (err) { next(err); }
  }

  async updateImage(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) throw new Error('Imagem é obrigatória');
      const product = await productsService.updateImage(req.params.id as string, req.file);
      auditService.log({
        userId: req.user?.id,
        action: 'PRODUCT_IMAGE_UPDATED',
        entity: 'Product',
        entityId: product.id,
        ipAddress: req.ip || (req.headers['x-forwarded-for'] as string),
      });
      return successResponse(res, product, 'Imagem atualizada com sucesso');
    } catch (err) { next(err); }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await productsService.delete(req.params.id as string);
      auditService.log({
        userId: req.user?.id,
        action: 'PRODUCT_DELETED',
        entity: 'Product',
        entityId: req.params.id as string,
        ipAddress: req.ip || (req.headers['x-forwarded-for'] as string),
      });
      return successResponse(res, null, 'Produto removido com sucesso');
    } catch (err) { next(err); }
  }
}

export const productsController = new ProductsController();
