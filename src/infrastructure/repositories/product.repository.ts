import { db } from '../db/db';
import { products as productsTable } from '../db/schema';
import { Product } from '../../core/entities/product';
import type { ProductRepository } from '../../core/repositories/product.repository';
import { asc, eq } from 'drizzle-orm';

interface ProductRow {
   id: string;
   name: string;
   description: string;
   price: string;
   stockQuantity: number;
   category: string;
   image: string;
   createdAt: Date;
   updatedAt: Date;
}

export class DrizzleProductRepository implements ProductRepository {
   constructor() {}

   async findById(id: string): Promise<Product | null> {
      const products = await db
         .select({
            id: productsTable.id,
            name: productsTable.name,
            description: productsTable.description,
            price: productsTable.price,
            stockQuantity: productsTable.stockQuantity,
            category: productsTable.category,
            image: productsTable.image,
            createdAt: productsTable.createdAt,
            updatedAt: productsTable.updatedAt,
         })
         .from(productsTable)
         .where(eq(productsTable.id, id));

      if (products.length === 0) return null;

      const [product] = products;
      return this.toDomain(product as ProductRow);
   }

   async findAll(): Promise<Product[]> {
      const allProducts = await db
         .select({
            id: productsTable.id,
            name: productsTable.name,
            description: productsTable.description,
            price: productsTable.price,
            stockQuantity: productsTable.stockQuantity,
            category: productsTable.category,
            image: productsTable.image,
            createdAt: productsTable.createdAt,
            updatedAt: productsTable.updatedAt,
         })
         .from(productsTable)
         .orderBy(asc(productsTable.category), asc(productsTable.name));

      return allProducts.map((row) => this.toDomain(row as ProductRow));
   }

   async create(product: Product): Promise<Product> {
      const primitives = product.toPrimitives();

      const newProductResult = await db
         .insert(productsTable)
         .values({
            id: primitives.id,
            name: primitives.name,
            description: primitives.description,
            price: primitives.price.toString(),
            stockQuantity: primitives.stockQuantity,
            category: primitives.category,
            image: primitives.image,
            createdAt: primitives.createdAt,
            updatedAt: primitives.updatedAt,
         })
         .returning({
            id: productsTable.id,
            name: productsTable.name,
            description: productsTable.description,
            price: productsTable.price,
            stockQuantity: productsTable.stockQuantity,
            category: productsTable.category,
            image: productsTable.image,
            createdAt: productsTable.createdAt,
            updatedAt: productsTable.updatedAt,
         });

      const [newProduct] = newProductResult;
      return this.toDomain(newProduct as ProductRow);
   }

   async update(product: Product): Promise<Product> {
      const primitives = product.toPrimitives();

      const updatedResult = await db
         .update(productsTable)
         .set({
            name: primitives.name,
            description: primitives.description,
            price: primitives.price.toString(),
            stockQuantity: primitives.stockQuantity,
            category: primitives.category,
            image: primitives.image,
            updatedAt: new Date(),
         })
         .where(eq(productsTable.id, primitives.id))
         .returning({
            id: productsTable.id,
            name: productsTable.name,
            description: productsTable.description,
            price: productsTable.price,
            stockQuantity: productsTable.stockQuantity,
            category: productsTable.category,
            image: productsTable.image,
            createdAt: productsTable.createdAt,
            updatedAt: productsTable.updatedAt,
         });

      const [updated] = updatedResult;
      return this.toDomain(updated as ProductRow);
   }

   async delete(id: string): Promise<void> {
      await db.delete(productsTable).where(eq(productsTable.id, id));
   }

   // ✅ Sin (this as any)
   private toDomain(row: ProductRow): Product {
      return Product.reconstituteFromDatabase({
         id: row.id,
         name: row.name,
         description: row.description ?? '',
         price: Number(row.price),
         stockQuantity: row.stockQuantity,
         category: row.category ?? '',
         image: row.image ?? '',
         createdAt: row.createdAt ?? new Date(),
         updatedAt: row.updatedAt ?? new Date(),
      });
   }
}
