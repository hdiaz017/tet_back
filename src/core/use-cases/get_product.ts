// src/core/use-cases/get-product/get-product.use-case.ts

import type { Product } from '../entities/product';
import type { ProductRepository } from '../repositories/product.repository';

export class GetProductUseCase {
   constructor(private productRepository: ProductRepository) {}

   // ✅ Recibe string (UUID)
   async execute(id: string): Promise<Product> {
      if (!id || id.trim() === '') {
         throw new Error('Product ID is required');
      }

      const product = await this.productRepository.findById(id);
      if (!product) {
         throw new Error('Product not found');
      }

      return product;
   }
}
