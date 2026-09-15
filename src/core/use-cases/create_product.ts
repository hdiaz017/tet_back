// src/core/use-cases/create-product/create-product.command.ts

import { Product } from '../entities/product';
import type { ProductRepository } from '../repositories/product.repository';

export interface CreateProductCommand {
   name: string;
   description: string;
   price: number;
   stockQuantity: number;
   category: string;
   image: string;
}

// src/core/use-cases/create-product/create-product.use-case.ts

export class CreateProductUseCase {
   constructor(private productRepository: ProductRepository) {}

   async execute(command: CreateProductCommand): Promise<Product> {
      // ✅ Usar factory method (que hace las validaciones)
      const product = Product.create(
         command.name,
         command.description,
         command.price,
         command.stockQuantity,
         command.category,
         command.image,
      );

      // ✅ Validar en dominio
      product.validate();

      // Guardar
      return await this.productRepository.create(product);
   }
}
