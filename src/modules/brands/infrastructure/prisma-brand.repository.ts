import { prisma } from '../../../config/database';
import { BrandRepository } from '../domain/brand.repository';
import { Brand, CreateBrandInput, PaginatedResult, UpdateBrandInput } from '../domain/brand.types';

export class PrismaBrandRepository implements BrandRepository {
  async list(page: number, limit: number, search?: string): Promise<PaginatedResult<Brand>> {
    const skip = (page - 1) * limit;
    const where = {
      deletedAt: null,
      ...(search && { name: { contains: search, mode: 'insensitive' as const } }),
    };

    const [brands, total] = await Promise.all([
      prisma.brand.findMany({ where, skip, take: limit, orderBy: { name: 'asc' } }),
      prisma.brand.count({ where }),
    ]);

    return {
      data: brands as Brand[],
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async listAll(): Promise<Brand[]> {
    return prisma.brand.findMany({
      where: { deletedAt: null, active: true },
      orderBy: { name: 'asc' },
    }) as Promise<Brand[]>;
  }

  findByName(name: string): Promise<Brand | null> {
    return prisma.brand.findUnique({ where: { name } });
  }

  findActiveById(id: string): Promise<Brand | null> {
    return prisma.brand.findFirst({ where: { id, deletedAt: null } });
  }

  create(data: CreateBrandInput): Promise<Brand> {
    return prisma.brand.create({ data });
  }

  update(id: string, data: UpdateBrandInput): Promise<Brand> {
    return prisma.brand.update({ where: { id }, data });
  }

  reactivate(id: string, data: CreateBrandInput): Promise<Brand> {
    return prisma.brand.update({
      where: { id },
      data: { ...data, deletedAt: null, active: true },
    });
  }

  async softDelete(id: string): Promise<void> {
    await prisma.brand.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}