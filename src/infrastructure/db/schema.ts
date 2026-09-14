import {
   pgTable,
   uuid,
   text,
   integer,
   numeric,
   timestamp,
   unique,
} from 'drizzle-orm/pg-core';

// Products Table
export const products = pgTable('products', {
   id: uuid('id').primaryKey().defaultRandom(),
   name: text('name').notNull(),
   description: text('description'),
   price: numeric('price', { precision: 10, scale: 2 }).notNull(),
   stockQuantity: integer('stock_quantity').notNull().default(0),
   category: text('category'),
   image: text('image'),
   createdAt: timestamp('created_at').defaultNow(),
   updatedAt: timestamp('updated_at').defaultNow(),
});

// Sales Table (The Order Header)
export const sales = pgTable(
   'sales',
   {
      id: uuid('id').primaryKey().defaultRandom(),
      externalSaleId: text('external_sale_id').notNull(), // ID del POS
      totalAmount: numeric('total_amount', {
         precision: 10,
         scale: 2,
      }).notNull(),
      soldAt: timestamp('sold_at').notNull(),
      createdAt: timestamp('created_at').defaultNow(),
   },
   (table) => ({
      // Garantiza idempotencia: mismo externalSaleId = mismo registro
      uniqueExternalSaleId: unique('unique_external_sale_id').on(
         table.externalSaleId,
      ),
   }),
);

// Sale Items Table
export const saleItems = pgTable('sale_items', {
   id: uuid('id').primaryKey().defaultRandom(),
   saleId: uuid('sale_id')
      .notNull()
      .references(() => sales.id),
   productId: uuid('product_id')
      .notNull()
      .references(() => products.id),
   quantity: integer('quantity').notNull(),
   priceAtSale: numeric('price_at_sale', { precision: 10, scale: 2 }).notNull(),
});
