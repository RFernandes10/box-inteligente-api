import { prisma } from '../../config/database';
import { AppError } from '../../shared/errors/AppError';

interface CreateCategoryInput {
  name: string;
  description?: string;
}

export class CategoriesService {
  async list(page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit;
    const where = {
      deletedAt: null,
      ...(search && { name: { contains: search, mode: 'insensitive' as const } }),
    };

    const [categories, total] = await Promise.all([
      prisma.category.findMany({ where, skip, take: limit, orderBy: { name: 'asc' } }),
      prisma.category.count({ where }),
    ]);

    return { data: categories, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async listAll() {
    return prisma.category.findMany({ where: { deletedAt: null, active: true }, orderBy: { name: 'asc' } });
  }

  async create(data: CreateCategoryInput) {
    const exists = await prisma.category.findUnique({ where: { name: data.name } });
    if (exists && !exists.deletedAt) throw new AppError('Categoria já cadastrada', 409, 'CATEGORY_EXISTS');

    if (exists && exists.deletedAt) {
      return prisma.category.update({ where: { id: exists.id }, data: { ...data, deletedAt: null, active: true } });
    }

    return prisma.category.create({ data });
  }

  async update(id: string, data: Partial<CreateCategoryInput>) {
    const category = await prisma.category.findFirst({ where: { id, deletedAt: null } });
    if (!category) throw new AppError('Categoria não encontrada', 404, 'CATEGORY_NOT_FOUND');

    if (data.name && data.name !== category.name) {
      const exists = await prisma.category.findUnique({ where: { name: data.name } });
      if (exists) throw new AppError('Categoria já cadastrada', 409, 'CATEGORY_EXISTS');
    }

    return prisma.category.update({ where: { id }, data });
  }

  async delete(id: string) {
    const category = await prisma.category.findFirst({ where: { id, deletedAt: null } });
    if (!category) throw new AppError('Categoria não encontrada', 404, 'CATEGORY_NOT_FOUND');
    await prisma.category.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}

export const categoriesService = new CategoriesService();
