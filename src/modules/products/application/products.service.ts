import { AppError } from '../../../shared/errors/AppError';
import { ProductRepository } from '../domain/product.repository';
import { CreateProductInput, Product, ProductImageFile, UpdateProductInput } from '../domain/product.types';

function imageUrlFor(file?: ProductImageFile | null): string | undefined {
  return file ? `/uploads/products/${file.filename}` : undefined;
}

export class ProductsService {
  constructor(private readonly repository: ProductRepository) {}

  list(page: number, limit: number, filters: Record<string, unknown> = {}) {
    return this.repository.list(page, limit, filters);
  }

  async getById(id: string): Promise<Product> {
    const product = await this.repository.findById(id);
    if (!product) throw new AppError('Produto não encontrado', 404, 'PRODUCT_NOT_FOUND');
    return product;
  }

  search(query: string) {
    return this.repository.search(query);
  }

  async create(data: CreateProductInput, imageFile?: ProductImageFile | null): Promise<Product> {
    if (data.barcode) {
      const exists = await this.repository.findByBarcode(data.barcode);
      if (exists) throw new AppError('Código de barras já cadastrado', 409, 'BARCODE_EXISTS');
    }

    const internalCode = data.internalCode || this.generateInternalCode();
    const existingCode = await this.repository.findByInternalCode(internalCode);
    if (existingCode) throw new AppError('Código interno já existe', 409, 'INTERNAL_CODE_EXISTS');

    return this.repository.create({
      ...data,
      internalCode,
      imageUrl: imageUrlFor(imageFile),
    });
  }

  async update(id: string, data: UpdateProductInput, imageFile?: ProductImageFile | null): Promise<Product> {
    const product = await this.repository.findById(id);
    if (!product) throw new AppError('Produto não encontrado', 404, 'PRODUCT_NOT_FOUND');

    if (data.barcode && data.barcode !== product.barcode) {
      const exists = await this.repository.findByBarcode(data.barcode);
      if (exists) throw new AppError('Código de barras já cadastrado', 409, 'BARCODE_EXISTS');
    }

    if (imageFile) {
      if (product.imageUrl) this.repository.removeImage(product.imageUrl);
    }

    return this.repository.update(id, {
      ...data,
      imageUrl: imageFile ? imageUrlFor(imageFile) : product.imageUrl,
    });
  }

  async updateImage(id: string, imageFile: ProductImageFile): Promise<Product> {
    const product = await this.repository.findById(id);
    if (!product) throw new AppError('Produto não encontrado', 404, 'PRODUCT_NOT_FOUND');

    if (product.imageUrl) this.repository.removeImage(product.imageUrl);
    return this.repository.updateImage(id, imageUrlFor(imageFile)!);
  }

  async delete(id: string): Promise<void> {
    const product = await this.repository.findById(id);
    if (!product) throw new AppError('Produto não encontrado', 404, 'PRODUCT_NOT_FOUND');
    await this.repository.softDelete(id);
  }

  private generateInternalCode(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `PRD-${timestamp}-${random}`;
  }
}