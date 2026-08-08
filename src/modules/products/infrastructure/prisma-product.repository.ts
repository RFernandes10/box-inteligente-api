import fs from 'fs';
import path from 'path';
import { Prisma } from '@prisma/client';
import { prisma } from '../../../config/database';
import { env } from '../../../config/env';
import { ProductRepository } from '../domain/product.repository';
import { PaginatedResult, Product } from '../domain/product.types';

const relation = {
  brand: { select: { id: true, name: true } },
  category: { select: { id: true, name: true } },
  supplier: { select: { id: true, name: true } },
} as const;

type ProductWithRelations = Prisma.ProductGetPayload<{ include: typeof relation }>;
type SearchProduct = Prisma.ProductGetPayload<{ include: { brand: { select: { id: true; name: true } }; category: { select: { id: true; name: true } } } }>;
type BaseProduct = Prisma.ProductGetPayload<Record<string, never>>;

function toDomain(p: ProductWithRelations | SearchProduct | BaseProduct): Product {
  return {
    ...p,
    weight: p.weight !== null ? Number(p.weight) : undefined,
    costPrice: Number(p.costPrice),
    salePrice: Number(p.salePrice),
  };
}

interface ProductCreateData {
  internalCode: string;
  barcode?: string;
  name: string;
  description?: string;
  brandId: string;
  categoryId: string;
  supplierId?: string;
  unit: string;
  weight?: number;
  costPrice: number;
  salePrice: number;
  minStock: number;
  maxStock?: number;
  location?: string;
  expirationDate?: string;
  imageUrl?: string;
  observations?: string;
}

interface ProductUpdateData {
  name?: string;
  description?: string;
  brandId?: string;
  categoryId?: string;
  supplierId?: string;
  unit?: string;
  weight?: number;
  costPrice?: number;
  salePrice?: number;
  minStock?: number;
  maxStock?: number;
  location?: string;
  expirationDate?: string;
  imageUrl?: string;
  observations?: string;
}

export class PrismaProductRepository implements ProductRepository {
  async list(page: number, limit: number, filters: Record<string, unknown> = {}): Promise<PaginatedResult<Product>> {
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
      prisma.product.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' }, include: relation }),
      prisma.product.count({ where }),
    ]);

    return { data: products.map(toDomain), pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findById(id: string): Promise<Product | null> {
    const product = await prisma.product.findFirst({ where: { id, deletedAt: null }, include: relation });
    return product ? toDomain(product) : null;
  }

  async search(query: string): Promise<Product[]> {
    const products = await prisma.product.findMany({
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
    return products.map(toDomain);
  }

  async findByBarcode(barcode: string): Promise<Product | null> {
    const p = await prisma.product.findUnique({ where: { barcode } });
    return p ? toDomain(p) : null;
  }

  async findByInternalCode(internalCode: string): Promise<Product | null> {
    const p = await prisma.product.findUnique({ where: { internalCode } });
    return p ? toDomain(p) : null;
  }

    async create(data: ProductCreateData): Promise<Product> {
    const product = await prisma.product.create({
      data: {
        internalCode: data.internalCode,
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
        imageUrl: data.imageUrl,
        observations: data.observations,
      },
      include: relation,
    });
    return toDomain(product);
  }

  async update(id: string, data: ProductUpdateData): Promise<Product> {
    const product = await prisma.product.update({
      where: { id },
      data: {
        ...data,
        expirationDate: data.expirationDate ? new Date(data.expirationDate) : undefined,
      },
      include: relation,
    });
    return toDomain(product);
  }

  async updateImage(id: string, imageUrl: string): Promise<Product> {
    const product = await prisma.product.update({ where: { id }, data: { imageUrl }, include: relation });
    return toDomain(product);
  }

  async softDelete(id: string): Promise<void> {
    await prisma.product.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  removeImage(imageUrl: string | null | undefined): void {
    if (!imageUrl) return;
    const oldPath = path.resolve(env.UPLOAD_PATH, imageUrl.replace('/uploads/', ''));
    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
  }
}