export interface Supplier {
  id: string;
  name: string;
  cnpj?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  responsible?: string | null;
  active: boolean;
  deletedAt: Date | null;
}

export interface CreateSupplierInput {
  name: string;
  cnpj?: string;
  email?: string;
  phone?: string;
  address?: string;
  responsible?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface SupplierRepository {
  list(page: number, limit: number, search?: string): Promise<PaginatedResult<Supplier>>;
  listAll(): Promise<Supplier[]>;
  findByCnpj(cnpj: string): Promise<Supplier | null>;
  findActiveById(id: string): Promise<Supplier | null>;
  create(data: CreateSupplierInput): Promise<Supplier>;
  update(id: string, data: Partial<CreateSupplierInput>): Promise<Supplier>;
  softDelete(id: string): Promise<void>;
}