export interface Category {
  id: string;
  name: string;
  description?: string | null;
  active: boolean;
  deletedAt: Date | null;
}

export interface CreateCategoryInput {
  name: string;
  description?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface CategoryRepository {
  list(page: number, limit: number, search?: string): Promise<PaginatedResult<Category>>;
  listAll(): Promise<Category[]>;
  findByName(name: string): Promise<Category | null>;
  findActiveById(id: string): Promise<Category | null>;
  create(data: CreateCategoryInput): Promise<Category>;
  update(id: string, data: CreateCategoryInput): Promise<Category>;
  reactivate(id: string, data: CreateCategoryInput): Promise<Category>;
  softDelete(id: string): Promise<void>;
}