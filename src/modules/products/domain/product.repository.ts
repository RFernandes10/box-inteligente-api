import {
  CreateProductInput,
  PaginatedResult,
  Product,
  UpdateProductInput,
} from './product.types';

export interface ProductRepository {
  list(page: number, limit: number, filters: Record<string, unknown>): Promise<PaginatedResult<Product>>;
  findById(id: string): Promise<Product | null>;
  search(query: string): Promise<Product[]>;
  findByBarcode(barcode: string): Promise<Product | null>;
  findByInternalCode(internalCode: string): Promise<Product | null>;
  create(data: CreateProductInput): Promise<Product>;
  update(id: string, data: UpdateProductInput): Promise<Product>;
  updateImage(id: string, imageUrl: string): Promise<Product>;
  softDelete(id: string): Promise<void>;
  removeImage(imageUrl: string | null | undefined): void;
}