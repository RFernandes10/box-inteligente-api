import { AppError } from '../../../shared/errors/AppError';
import { BrandRepository } from '../domain/brand.repository';
import { CreateBrandInput, UpdateBrandInput } from '../domain/brand.types';

export class BrandsService {
  constructor(private readonly repository: BrandRepository) {}

  list(page: number, limit: number, search?: string) {
    return this.repository.list(page, limit, search);
  }

  listAll() {
    return this.repository.listAll();
  }

  async create(data: CreateBrandInput) {
    const exists = await this.repository.findByName(data.name);
    if (exists && !exists.deletedAt) {
      throw new AppError('Marca já cadastrada', 409, 'BRAND_EXISTS');
    }

    if (exists && exists.deletedAt) {
      return this.repository.reactivate(exists.id, data);
    }

    return this.repository.create(data);
  }

  async update(id: string, data: UpdateBrandInput) {
    const brand = await this.repository.findActiveById(id);
    if (!brand) {
      throw new AppError('Marca não encontrada', 404, 'BRAND_NOT_FOUND');
    }

    if (data.name && data.name !== brand.name) {
      const exists = await this.repository.findByName(data.name);
      if (exists && exists.deletedAt === null) {
        throw new AppError('Marca já cadastrada', 409, 'BRAND_EXISTS');
      }
    }

    return this.repository.update(id, data);
  }

  async delete(id: string) {
    const brand = await this.repository.findActiveById(id);
    if (!brand) {
      throw new AppError('Marca não encontrada', 404, 'BRAND_NOT_FOUND');
    }
    await this.repository.softDelete(id);
  }
}