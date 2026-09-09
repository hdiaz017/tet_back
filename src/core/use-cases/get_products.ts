import { Product } from '../entities/product';
import type { ProductRepository } from '../repositories/product.repository';

export class GetProductsUseCase {
   constructor(private productRepository: ProductRepository) {}

   async execute(): Promise<Product[]> {
      return await this.productRepository.findAll();
   }
}
