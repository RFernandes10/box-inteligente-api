import { User, UserWithPassword, PaginatedResult, UserRole } from './user.types';

export interface UserRepository {
  list(page: number, limit: number): Promise<PaginatedResult<User>>;
  findByEmail(email: string): Promise<UserWithPassword | null>;
  findById(id: string): Promise<UserWithPassword | null>;
  create(data: { name: string; email: string; passwordHash: string; role: UserRole; mustChangePassword?: boolean }): Promise<User>;
  update(id: string, data: { name?: string; email?: string; passwordHash?: string; role?: UserRole; mustChangePassword?: boolean }): Promise<User>;
  toggleStatus(id: string): Promise<Pick<User, 'id' | 'name' | 'email' | 'role' | 'active'>>;
  softDelete(id: string): Promise<void>;
}