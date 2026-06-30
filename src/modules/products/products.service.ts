import { prisma } from '../../config/database';
import { AppError } from '../../shared/errors/AppError';
import fs from 'fs';
import path from 'path';
import { env } from '../../config/env';

interface CreateProductInput {
  internalCode?: string;
  barcode?: string;
  name: string;
  description?: string;
  brandId: string;
  categoryId: string;
  supplierId?: string;
  unit?: string;
  weight?: number;
  costPrice: number;
  salePrice: number;
  minStock?: number;
  maxStock?: number;
  location?: string;
  expirationDate?: string;
  observations?: string;
}

export class ProductsService {
  private generateInternalCode(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `PRD-${timestamp}-${random}`;
  }

  async list(page = 1, limit = 20, filters: Record<string, unknown> = {}) {
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = { deletedAt: null };

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search as string, mode: 'insensitive' } },
        { internalCode: { contains: filters.search as string, mode: 'insensitive' } },
        { barcode: { contains: filters.search as string, mode: 'insensitive' } },
      ];
    }
    if (filters.brandId) where.brandId = filters.brandId;
    if (filters.categoryId) where.categoryId = filters.categoryId;
    if (filters.supplierId) where.supplierId = filters.supplierId;
    if (filters.active !== undefined) where.active = filters.active;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          brand: { select: { id: true, name: true } },
          category: { select: { id: true, name: true } },
          supplier: { select: { id: true, name: true } },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return { data: products, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async getById(id: string) {
    const product = await prisma.product.findFirst({
      where: { id, deletedAt: null },
      include: {
        brand: { select: { id: true, name: true } },
        category: { select: { id: true, name: true } },
        supplier: { select: { id: true, name: true } },
      },
    });
    if (!product) throw new AppError('Produto não encontrado', 404, 'PRODUCT_NOT_FOUND');
    return product;
  }

  async search(query: string) {
    return prisma.product.findMany({
      where: {
        deletedAt: null,
        active: true,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { internalCode: { contains: query, mode: 'insensitive' } },
          { barcode: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 10,
      include: {
        brand: { select: { id: true, name: true } },
        category: { select: { id: true, name: true } },
      },
    });
  }

  async create(data: CreateProductInput, imageFile?: Express.Multer.File) {
    if (data.barcode) {
      const exists = await prisma.product.findUnique({ where: { barcode: data.barcode } });
      if (exists) throw new AppError('Código de barras já cadastrado', 409, 'BARCODE_EXISTS');
    }

    const internalCode = data.internalCode || this.generateInternalCode();

    const existingCode = await prisma.product.findUnique({ where: { internalCode } });
    if (existingCode) throw new AppError('Código interno já existe', 409, 'INTERNAL_CODE_EXISTS');

    const imageUrl = imageFile ? `/uploads/products/${imageFile.filename}` : undefined;

    return prisma.product.create({
      data: {
        internalCode,
        barcode: data.barcode,
        name: data.name,
        description: data.description,
        brandId: data.brandId,
        categoryId: data.categoryId,
        supplierId: data.supplierId,
        unit: data.unit || 'UN',
        weight: data.weight,
        costPrice: data.costPrice,
        salePrice: data.salePrice,
        minStock: data.minStock || 0,
        maxStock: data.maxStock,
        location: data.location,
        expirationDate: data.expirationDate ? new Date(data.expirationDate) : undefined,
        imageUrl,
        observations: data.observations,
      },
      include: {
        brand: { select: { id: true, name: true } },
        category: { select: { id: true, name: true } },
        supplier: { select: { id: true, name: true } },
      },
    });
  }

  async update(id: string, data: Partial<CreateProductInput>, imageFile?: Express.Multer.File) {
    const product = await prisma.product.findFirst({ where: { id, deletedAt: null } });
    if (!product) throw new AppError('Produto não encontrado', 404, 'PRODUCT_NOT_FOUND');

    if (data.barcode && data.barcode !== product.barcode) {
      const exists = await prisma.product.findUnique({ where: { barcode: data.barcode } });
      if (exists) throw new AppError('Código de barras já cadastrado', 409, 'BARCODE_EXISTS');
    }

    let imageUrl = product.imageUrl;
    if (imageFile) {
      if (product.imageUrl) {
        const oldPath = path.resolve(env.UPLOAD_PATH, product.imageUrl.replace('/uploads/', ''));
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      imageUrl = `/uploads/products/${imageFile.filename}`;
    }

    return prisma.product.update({
      where: { id },
      data: {
        ...data,
        expirationDate: data.expirationDate ? new Date(data.expirationDate) : undefined,
        imageUrl,
      },
      include: {
        brand: { select: { id: true, name: true } },
        category: { select: { id: true, name: true } },
        supplier: { select: { id: true, name: true } },
      },
    });
  }

  async updateImage(id: string, imageFile: Express.Multer.File) {
    const product = await prisma.product.findFirst({ where: { id, deletedAt: null } });
    if (!product) throw new AppError('Produto não encontrado', 404, 'PRODUCT_NOT_FOUND');

    if (product.imageUrl) {
      const oldPath = path.resolve(env.UPLOAD_PATH, product.imageUrl.replace('/uploads/', ''));
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    return prisma.product.update({
      where: { id },
      data: { imageUrl: `/uploads/products/${imageFile.filename}` },
    });
  }

  async delete(id: string) {
    const product = await prisma.product.findFirst({ where: { id, deletedAt: null } });
    if (!product) throw new AppError('Produto não encontrado', 404, 'PRODUCT_NOT_FOUND');
    await prisma.product.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}

export const productsService = new ProductsService();
