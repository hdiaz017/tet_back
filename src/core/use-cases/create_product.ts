import { Product } from '../entities/product';
import type { ProductRepository } from '../repositories/product.repository';

export class CreateProductUseCase {
   constructor(private productRepository: ProductRepository) {}

   async execute(data: Partial<Product>): Promise<Product> {
      // Business validation
      if (!data.name) throw new Error('Product name is required');
      if (data.price === undefined || data.price < 0)
         throw new Error('A valid price is required');
      if (data.stockQuantity! < 0) throw new Error('Stock cannot be negative');

      const product = new Product(
         undefined,
         data.name!,
         data.description!,
         Number(data.price),
         data.stockQuantity!,
         data.category!,
      );

      return await this.productRepository.create(product);
   }
}
