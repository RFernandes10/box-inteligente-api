import { prisma } from '../../config/database';
import { AppError } from '../../shared/errors/AppError';

interface CreateSupplierInput {
  name: string;
  cnpj?: string;
  email?: string;
  phone?: string;
  address?: string;
  responsible?: string;
}

export class SuppliersService {
  async list(page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit;
    const where = {
      deletedAt: null,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { cnpj: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [suppliers, total] = await Promise.all([
      prisma.supplier.findMany({ where, skip, take: limit, orderBy: { name: 'asc' } }),
      prisma.supplier.count({ where }),
    ]);

    return { data: suppliers, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async listAll() {
    return prisma.supplier.findMany({ where: { deletedAt: null, active: true }, orderBy: { name: 'asc' } });
  }

  async create(data: CreateSupplierInput) {
    if (data.cnpj) {
      const exists = await prisma.supplier.findUnique({ where: { cnpj: data.cnpj } });
      if (exists && !exists.deletedAt) throw new AppError('CNPJ já cadastrado', 409, 'CNPJ_EXISTS');
    }
    return prisma.supplier.create({ data });
  }

  async update(id: string, data: Partial<CreateSupplierInput>) {
    const supplier = await prisma.supplier.findFirst({ where: { id, deletedAt: null } });
    if (!supplier) throw new AppError('Fornecedor não encontrado', 404, 'SUPPLIER_NOT_FOUND');

    if (data.cnpj && data.cnpj !== supplier.cnpj) {
      const exists = await prisma.supplier.findUnique({ where: { cnpj: data.cnpj } });
      if (exists) throw new AppError('CNPJ já cadastrado', 409, 'CNPJ_EXISTS');
    }

    return prisma.supplier.update({ where: { id }, data });
  }

  async delete(id: string) {
    const supplier = await prisma.supplier.findFirst({ where: { id, deletedAt: null } });
    if (!supplier) throw new AppError('Fornecedor não encontrado', 404, 'SUPPLIER_NOT_FOUND');
    await prisma.supplier.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}

export const suppliersService = new SuppliersService();
