import { Product } from '../entities/product';
import type { ProductRepository } from '../repositories/product.repository';

export class GetProductUseCase {
   constructor(private productRepository: ProductRepository) {}

   async execute(id: number): Promise<Product> {
      const product = await this.productRepository.findById(id);
      if (!product) {
         throw new Error('Product not found');
      }
      return product;
   }
}
