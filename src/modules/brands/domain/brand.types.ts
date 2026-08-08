export interface Brand {
  id: string;
  name: string;
  description?: string | null;
  logoUrl?: string | null;
  active: boolean;
  deletedAt: Date | null;
}

export interface CreateBrandInput {
  name: string;
  description?: string;
  logoUrl?: string;
}

export interface UpdateBrandInput {
  name?: string;
  description?: string;
  logoUrl?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}