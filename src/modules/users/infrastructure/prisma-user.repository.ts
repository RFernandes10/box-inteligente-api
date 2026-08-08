import { prisma } from '../../../config/database';
import { UserRepository } from '../domain/user.repository';
import { User, UserWithPassword, PaginatedResult, UserRole } from '../domain/user.types';

const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  active: true,
  createdAt: true,
  updatedAt: true,
};

export class PrismaUserRepository implements UserRepository {
  async list(page: number, limit: number): Promise<PaginatedResult<User>> {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: { deletedAt: null },
        select: userSelect,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where: { deletedAt: null } }),
    ]);

    return {
      data: users as User[],
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findByEmail(email: string): Promise<UserWithPassword | null> {
    return prisma.user.findUnique({ where: { email } }) as Promise<UserWithPassword | null>;
  }

  async findById(id: string): Promise<UserWithPassword | null> {
    return prisma.user.findFirst({ where: { id, deletedAt: null } }) as Promise<UserWithPassword | null>;
  }

  async create(data: { name: string; email: string; passwordHash: string; role: UserRole; mustChangePassword?: boolean }): Promise<User> {
    return prisma.user.create({
      data: { ...data, mustChangePassword: data.mustChangePassword ?? true },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        createdAt: true,
      },
    }) as Promise<User>;
  }

  async update(
    id: string,
    data: { name?: string; email?: string; passwordHash?: string; role?: UserRole; mustChangePassword?: boolean }
  ): Promise<User> {
    const updateData: { name?: string; email?: string; passwordHash?: string; role?: UserRole; mustChangePassword?: boolean } = { ...data };
    if (data.passwordHash) {
      updateData.mustChangePassword = true;
    }
    return prisma.user.update({
      where: { id },
      data: updateData,
      select: userSelect,
    }) as Promise<User>;
  }

  async toggleStatus(id: string): Promise<Pick<User, 'id' | 'name' | 'email' | 'role' | 'active'>> {
    const current = await prisma.user.findFirst({ where: { id, deletedAt: null } });
    return prisma.user.update({
      where: { id },
      data: { active: !current?.active },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
      },
    });
  }

  async softDelete(id: string): Promise<void> {
    await prisma.user.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}