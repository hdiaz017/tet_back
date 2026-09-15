// src/core/use-cases/update-product/update-product.command.ts

import type { Product } from '../entities/product';
import type { ProductRepository } from '../repositories/product.repository';

export interface UpdateProductCommand {
   id: string; // UUID
   name?: string;
   description?: string;
   price?: number;
   stockQuantity?: number;
   category?: string;
   image?: string;
}

// src/core/use-cases/update-product/update-product.use-case.ts

export class UpdateProductUseCase {
   constructor(private productRepository: ProductRepository) {}

   async execute(command: UpdateProductCommand): Promise<Product> {
      // ✅ Cargar producto existente
      const product = await this.productRepository.findById(command.id);
      if (!product) {
         throw new Error('Product not found');
      }

      // ✅ Actualizar usando métodos del entity
      if (command.price !== undefined) {
         product.updatePrice(command.price);
      }

      if (command.stockQuantity !== undefined) {
         const diff = command.stockQuantity - product.getStockQuantity();
         if (diff > 0) {
            product.increaseStock(diff);
         } else if (diff < 0) {
            product.reduceStock(-diff);
         }
      }

      product.updateInfo({
         ...(command.name !== undefined && { name: command.name }),
         ...(command.description !== undefined && {
            description: command.description,
         }),
         ...(command.category !== undefined && { category: command.category }),
         ...(command.image !== undefined && { image: command.image }),
      });

      // Validar
      product.validate();

      // Guardar
      return await this.productRepository.update(product);
   }
}
