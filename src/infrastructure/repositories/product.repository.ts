import { db } from '../db/db';
import { products as productsTable } from '../db/schema';
import { Product } from '../../core/entities/product';
import type { ProductRepository } from '../../core/repositories/product.repository';
import { eq } from 'drizzle-orm';

export class DrizzleProductRepository implements ProductRepository {
   constructor() {}

   async findById(id: number): Promise<Product | null> {
      const [product] = await db
         .select()
         .from(productsTable)
         .where(eq(productsTable.id, id));
      if (!product) return null;
      return this.mapToEntity(product);
   }

   async findAll(): Promise<Product[]> {
      const allProducts = await db.select().from(productsTable);
      return allProducts.map(this.mapToEntity);
   }

   async create(product: Product): Promise<Product> {
      const [newProduct] = await db
         .insert(productsTable)
         .values({
            name: product.name,
            description: product.description,
            price: product.price.toString(),
            stockQuantity: product.stockQuantity,
            category: product.category,
            image: product.image,
         })
         .returning();
      return this.mapToEntity(newProduct);
   }

   async update(product: Product): Promise<Product> {
      if (!product.id) {
         throw new Error('Product must have an ID to be updated');
      }
      const [updated] = await db
         .update(productsTable)
         .set({
            name: product.name,
            description: product.description,
            price: product.price.toString(),
            stockQuantity: product.stockQuantity,
            category: product.category,
         })
         .where(eq(productsTable.id, Number(product.id)))
         .returning();
      return this.mapToEntity(updated);
   }

   async delete(id: number): Promise<void> {
      await db.delete(productsTable).where(eq(productsTable.id, id));
   }

   private mapToEntity(data: any): Product {
      return new Product(
         data.id,
         data.name,
         data.description,
         Number(data.price),
         data.stockQuantity,
         data.category,
         data.image,
      );
   }
}
