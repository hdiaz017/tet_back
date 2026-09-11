import { Product } from '../../core/entities/product';
import { db, type ProductRecord } from '../db/indexeddb';
import type { ProductRepository } from '../../core/repositories/product.repository';
export class IndexedDbProductRepository implements ProductRepository {
   async findById(id: number): Promise<Product | null> {
      const product = await db.products.get(id.toString());
      if (!product) return null;
      return this.mapToEntity(product);
   }

   async findAll(): Promise<Product[]> {
      const allProducts = await db.products.orderBy('name').toArray();
      return allProducts.map(this.mapToEntity);
   }

   // Note: As discussed, we won't use create() here as products
   // are managed by the ProductSyncService from Supabase.
   async create(product: Product): Promise<Product> {
      throw new Error('Product creation is managed via ProductSyncService');
   }

   async update(product: Product): Promise<Product> {
      if (!product.id) {
         throw new Error('Product must have an ID to be updated');
      }
      await db.products.update(product.id.toString(), {
         name: product.name,
         description: product.description,
         price: product.price,
         stockQuantity: product.stockQuantity,
         category: product.category,
         updatedAt: new Date().toISOString(),
      });
      return product;
   }

   async delete(id: number): Promise<void> {
      await db.products.delete(id.toString());
   }

   private mapToEntity(data: ProductRecord): Product {
      return new Product(
         data.id,
         data.name,
         data.description,
         Number(data.price),
         data.stockQuantity,
         data.category,
      );
   }
}
