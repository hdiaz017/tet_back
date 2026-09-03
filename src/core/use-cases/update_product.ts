import { Product } from '../entities/product';
import type { ProductRepository } from '../repositories/product.repository';

export class UpdateProductUseCase {
   constructor(private productRepository: ProductRepository) {}

   async execute(id: number, data: Partial<Product>): Promise<Product> {
      const product = await this.productRepository.findById(id);
      if (!product) {
         throw new Error('Product not found');
      }

      // Create a new instance with updated values instead of modifying the existing one
      const updatedProduct = new Product(
         data.name !== undefined ? data.name : product.name,
         data.description !== undefined
            ? data.description
            : product.description,
         data.price !== undefined ? data.price : product.price,
         data.stockQuantity !== undefined
            ? data.stockQuantity
            : product.stockQuantity,
         data.category !== undefined ? data.category : product.category,
         product.id,
      );

      return await this.productRepository.update(updatedProduct);
   }
}
