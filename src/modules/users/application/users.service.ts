import { AppError } from '../../../shared/errors/AppError';
import { PasswordHasher } from '../../../shared/security/password-hasher';
import { UserRepository } from '../domain/user.repository';
import { CreateUserInput, UpdateUserInput, PaginatedResult, User, UserRole } from '../domain/user.types';

export class UsersService {
  constructor(
    private readonly repository: UserRepository,
    private readonly passwordHasher: PasswordHasher
  ) {}

  list(page = 1, limit = 20): Promise<PaginatedResult<User>> {
    return this.repository.list(page, limit);
  }

  async create(data: CreateUserInput): Promise<User> {
    const emailExists = await this.repository.findByEmail(data.email);
    if (emailExists) {
      throw new AppError('Email já cadastrado', 409, 'EMAIL_EXISTS');
    }

    const passwordHash = await this.passwordHasher.hash(data.password);

    return this.repository.create({
      name: data.name,
      email: data.email,
      passwordHash,
      role: data.role || 'STOCKIST',
    });
  }

  async update(id: string, data: UpdateUserInput): Promise<User> {
    const user = await this.repository.findById(id);
    if (!user) {
      throw new AppError('Usuário não encontrado', 404, 'USER_NOT_FOUND');
    }

    if (data.email && data.email !== user.email) {
      const emailExists = await this.repository.findByEmail(data.email);
      if (emailExists) {
        throw new AppError('Email já cadastrado', 409, 'EMAIL_EXISTS');
      }
    }

    const updateData: { name?: string; email?: string; passwordHash?: string; role?: UserRole; mustChangePassword?: boolean } = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.password) {
      updateData.passwordHash = await this.passwordHasher.hash(data.password);
    }

    return this.repository.update(id, updateData);
  }

  async toggleStatus(id: string): Promise<Pick<User, 'id' | 'name' | 'email' | 'role' | 'active'>> {
    const user = await this.repository.findById(id);
    if (!user) {
      throw new AppError('Usuário não encontrado', 404, 'USER_NOT_FOUND');
    }
    return this.repository.toggleStatus(id);
  }

  async delete(id: string): Promise<void> {
    const user = await this.repository.findById(id);
    if (!user) {
      throw new AppError('Usuário não encontrado', 404, 'USER_NOT_FOUND');
    }
    await this.repository.softDelete(id);
  }
}