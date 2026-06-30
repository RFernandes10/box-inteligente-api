import { prisma } from '../../config/database';
import { AppError } from '../../shared/errors/AppError';

interface CreateBrandInput {
  name: string;
  description?: string;
  logoUrl?: string;
}

interface UpdateBrandInput {
  name?: string;
  description?: string;
  logoUrl?: string;
}

export class BrandsService {
  async list(page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit;
    const where = {
      deletedAt: null,
      ...(search && { name: { contains: search, mode: 'insensitive' as const } }),
    };

    const [brands, total] = await Promise.all([
      prisma.brand.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      prisma.brand.count({ where }),
    ]);

    return {
      data: brands,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async listAll() {
    return prisma.brand.findMany({
      where: { deletedAt: null, active: true },
      orderBy: { name: 'asc' },
    });
  }

  async create(data: CreateBrandInput) {
    const exists = await prisma.brand.findUnique({ where: { name: data.name } });
    if (exists && !exists.deletedAt) {
      throw new AppError('Marca já cadastrada', 409, 'BRAND_EXISTS');
    }

    if (exists && exists.deletedAt) {
      return prisma.brand.update({
        where: { id: exists.id },
        data: { ...data, deletedAt: null, active: true },
      });
    }

    return prisma.brand.create({ data });
  }

  async update(id: string, data: UpdateBrandInput) {
    const brand = await prisma.brand.findFirst({ where: { id, deletedAt: null } });
    if (!brand) {
      throw new AppError('Marca não encontrada', 404, 'BRAND_NOT_FOUND');
    }

    if (data.name && data.name !== brand.name) {
      const exists = await prisma.brand.findUnique({ where: { name: data.name } });
      if (exists) {
        throw new AppError('Marca já cadastrada', 409, 'BRAND_EXISTS');
      }
    }

    return prisma.brand.update({ where: { id }, data });
  }

  async delete(id: string) {
    const brand = await prisma.brand.findFirst({ where: { id, deletedAt: null } });
    if (!brand) {
      throw new AppError('Marca não encontrada', 404, 'BRAND_NOT_FOUND');
    }

    await prisma.brand.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}

export const brandsService = new BrandsService();
