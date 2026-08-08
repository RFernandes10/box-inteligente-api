import { prisma } from '../../../config/database';
import { CategoryRepository } from '../domain/category.repository';
import { Category, CreateCategoryInput, PaginatedResult } from '../domain/category.repository';

export class PrismaCategoryRepository implements CategoryRepository {
  async list(page: number, limit: number, search?: string): Promise<PaginatedResult<Category>> {
    const skip = (page - 1) * limit;
    const where = {
      deletedAt: null,
      ...(search && { name: { contains: search, mode: 'insensitive' as const } }),
    };

    const [categories, total] = await Promise.all([
      prisma.category.findMany({ where, skip, take: limit, orderBy: { name: 'asc' } }),
      prisma.category.count({ where }),
    ]);

    return {
      data: categories as Category[],
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async listAll(): Promise<Category[]> {
    return prisma.category.findMany({ where: { deletedAt: null, active: true }, orderBy: { name: 'asc' } }) as Promise<Category[]>;
  }

  findByName(name: string): Promise<Category | null> {
    return prisma.category.findUnique({ where: { name } });
  }

  findActiveById(id: string): Promise<Category | null> {
    return prisma.category.findFirst({ where: { id, deletedAt: null } });
  }

  create(data: CreateCategoryInput): Promise<Category> {
    return prisma.category.create({ data });
  }

  update(id: string, data: CreateCategoryInput): Promise<Category> {
    return prisma.category.update({ where: { id }, data });
  }

  reactivate(id: string, data: CreateCategoryInput): Promise<Category> {
    return prisma.category.update({ where: { id }, data: { ...data, deletedAt: null, active: true } });
  }

  async softDelete(id: string): Promise<void> {
    await prisma.category.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}