import {
   pgTable,
   serial,
   text,
   integer,
   numeric,
   timestamp,
} from 'drizzle-orm/pg-core';

// Products Table
export const products = pgTable('products', {
   id: serial('id').primaryKey(),
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
export const sales = pgTable('sales', {
   id: serial('id').primaryKey(),
   totalAmount: numeric('total_amount', { precision: 10, scale: 2 }).notNull(),
   soldAt: timestamp('sold_at').defaultNow(),
});

// Sale Items Table (The link between Sales and Products)
// This allows multiple products per sale.
export const saleItems = pgTable('sale_items', {
   id: serial('id').primaryKey(),
   saleId: integer('sale_id')
      .notNull()
      .references(() => sales.id),
   productId: integer('product_id')
      .notNull()
      .references(() => products.id),
   quantity: integer('quantity').notNull(),
   // We store the price here because the price in the products table might change over time
   priceAtSale: numeric('price_at_sale', { precision: 10, scale: 2 }).notNull(),
});
