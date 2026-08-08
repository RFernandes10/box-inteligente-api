import { prisma } from '../../../config/database';
import { SupplierRepository } from '../domain/supplier.repository';
import { CreateSupplierInput, PaginatedResult, Supplier } from '../domain/supplier.repository';

export class PrismaSupplierRepository implements SupplierRepository {
  async list(page: number, limit: number, search?: string): Promise<PaginatedResult<Supplier>> {
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

    return { data: suppliers as Supplier[], pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async listAll(): Promise<Supplier[]> {
    return prisma.supplier.findMany({ where: { deletedAt: null, active: true }, orderBy: { name: 'asc' } }) as Promise<Supplier[]>;
  }

  findByCnpj(cnpj: string): Promise<Supplier | null> {
    return prisma.supplier.findUnique({ where: { cnpj } });
  }

  findActiveById(id: string): Promise<Supplier | null> {
    return prisma.supplier.findFirst({ where: { id, deletedAt: null } });
  }

  create(data: CreateSupplierInput): Promise<Supplier> {
    return prisma.supplier.create({ data });
  }

  update(id: string, data: Partial<CreateSupplierInput>): Promise<Supplier> {
    return prisma.supplier.update({ where: { id }, data });
  }

  async softDelete(id: string): Promise<void> {
    await prisma.supplier.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}