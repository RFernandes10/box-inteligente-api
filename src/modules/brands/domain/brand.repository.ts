import { Brand, CreateBrandInput, PaginatedResult, UpdateBrandInput } from './brand.types';

export interface BrandRepository {
  list(page: number, limit: number, search?: string): Promise<PaginatedResult<Brand>>;
  listAll(): Promise<Brand[]>;
  findByName(name: string): Promise<Brand | null>;
  findActiveById(id: string): Promise<Brand | null>;
  create(data: CreateBrandInput): Promise<Brand>;
  update(id: string, data: UpdateBrandInput): Promise<Brand>;
  reactivate(id: string, data: CreateBrandInput): Promise<Brand>;
  softDelete(id: string): Promise<void>;
}