import { AppError } from '../../../shared/errors/AppError';
import { CategoryRepository } from '../domain/category.repository';
import { CreateCategoryInput } from '../domain/category.repository';

export class CategoriesService {
  constructor(private readonly repository: CategoryRepository) {}

  list(page: number, limit: number, search?: string) {
    return this.repository.list(page, limit, search);
  }

  listAll() {
    return this.repository.listAll();
  }

  async create(data: CreateCategoryInput) {
    const exists = await this.repository.findByName(data.name);
    if (exists && !exists.deletedAt) throw new AppError('Categoria já cadastrada', 409, 'CATEGORY_EXISTS');

    if (exists && exists.deletedAt) {
      return this.repository.reactivate(exists.id, data);
    }

    return this.repository.create(data);
  }

  async update(id: string, data: CreateCategoryInput) {
    const category = await this.repository.findActiveById(id);
    if (!category) throw new AppError('Categoria não encontrada', 404, 'CATEGORY_NOT_FOUND');

    if (data.name && data.name !== category.name) {
      const exists = await this.repository.findByName(data.name);
      if (exists && exists.deletedAt === null) throw new AppError('Categoria já cadastrada', 409, 'CATEGORY_EXISTS');
    }

    return this.repository.update(id, data);
  }

  async delete(id: string) {
    const category = await this.repository.findActiveById(id);
    if (!category) throw new AppError('Categoria não encontrada', 404, 'CATEGORY_NOT_FOUND');
    await this.repository.softDelete(id);
  }
}