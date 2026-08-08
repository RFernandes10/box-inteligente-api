import { AppError } from '../../../shared/errors/AppError';
import { SupplierRepository } from '../domain/supplier.repository';
import { CreateSupplierInput } from '../domain/supplier.repository';

export class SuppliersService {
  constructor(private readonly repository: SupplierRepository) {}

  list(page: number, limit: number, search?: string) {
    return this.repository.list(page, limit, search);
  }

  listAll() {
    return this.repository.listAll();
  }

  async create(data: CreateSupplierInput) {
    if (data.cnpj) {
      const exists = await this.repository.findByCnpj(data.cnpj);
      if (exists && exists.deletedAt === null) throw new AppError('CNPJ já cadastrado', 409, 'CNPJ_EXISTS');
    }
    return this.repository.create(data);
  }

  async update(id: string, data: Partial<CreateSupplierInput>) {
    const supplier = await this.repository.findActiveById(id);
    if (!supplier) throw new AppError('Fornecedor não encontrado', 404, 'SUPPLIER_NOT_FOUND');

    if (data.cnpj && data.cnpj !== supplier.cnpj) {
      const exists = await this.repository.findByCnpj(data.cnpj);
      if (exists) throw new AppError('CNPJ já cadastrado', 409, 'CNPJ_EXISTS');
    }

    return this.repository.update(id, data);
  }

  async delete(id: string) {
    const supplier = await this.repository.findActiveById(id);
    if (!supplier) throw new AppError('Fornecedor não encontrado', 404, 'SUPPLIER_NOT_FOUND');
    await this.repository.softDelete(id);
  }
}