export interface Product {
  id: string;
  internalCode: string;
  barcode?: string | null;
  name: string;
  description?: string | null;
  brandId: string;
  categoryId: string;
  supplierId?: string | null;
  unit: string;
  weight?: number | null;
  costPrice: number;
  salePrice: number;
  minStock: number;
  maxStock?: number | null;
  currentStock: number;
  location?: string | null;
  expirationDate?: Date | null;
  imageUrl?: string | null;
  observations?: string | null;
  active: boolean;
  deletedAt: Date | null;
  brand?: { id: string; name: string } | null;
  category?: { id: string; name: string } | null;
  supplier?: { id: string; name: string } | null;
}

export interface CreateProductInput {
  internalCode?: string;
  barcode?: string;
  name: string;
  description?: string;
  brandId: string;
  categoryId: string;
  supplierId?: string;
  unit?: string;
  weight?: number;
  costPrice: number;
  salePrice: number;
  minStock?: number;
  maxStock?: number;
  location?: string;
  expirationDate?: string;
  observations?: string;
  imageUrl?: string;
}

export type UpdateProductInput = Partial<CreateProductInput>;

export interface ProductImageFile {
  filename: string;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}