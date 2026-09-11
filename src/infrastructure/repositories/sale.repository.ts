import { db } from '../db/db';
import { sales as salesTable, saleItems as saleItemsTable } from '../db/schema';
import { Sale, type SaleItem } from '../../core/entities/sale';
import type { SaleRepository } from '../../core/repositories/sale.repository';
import { eq } from 'drizzle-orm';

// Explicit type for the database row to ensure full type safety
interface SaleRow {
   id: number;
   totalAmount: string; // numeric is string in Drizzle
   soldAt: Date | string | null;
}

export class DrizzleSaleRepository implements SaleRepository {
   async create(sale: Sale): Promise<Sale> {
      // 1. Insert into sales table
      const results = await db
         .insert(salesTable)
         .values({
            totalAmount: sale.totalAmount.toString(),
            soldAt: sale.soldAt,
         })
         .returning({
            id: salesTable.id,
            totalAmount: salesTable.totalAmount,
            soldAt: salesTable.soldAt,
         });

      if (results.length === 0) {
         throw new Error('Failed to create sale record');
      }

      const newSale = results[0] as SaleRow;

      // 2. Insert into sale_items table
      const itemsToInsert = sale.items.map((item) => ({
         saleId: newSale.id,
         productId: item.productId,
         quantity: item.quantity,
         priceAtSale: item.priceAtSale.toString(),
      }));

      await db.insert(saleItemsTable).values(itemsToInsert);

      return this.mapToEntity(newSale, sale.items);
   }

   async findAll(): Promise<Sale[]> {
      // Perform a join between sales and sale_items
      const rows = await db
         .select({
            id: salesTable.id,
            totalAmount: salesTable.totalAmount,
            soldAt: salesTable.soldAt,
            // We select the whole item row to handle the One-to-Many relationship
            items: saleItemsTable,
         })
         .from(salesTable)
         .leftJoin(saleItemsTable, eq(salesTable.id, saleItemsTable.saleId));

      // Because a JOIN returns a row for every item, we need to group them.
      // We use a Map to ensure each Sale ID only appears once.
      const salesMap = new Map<number, Sale>();

      for (const row of rows) {
         if (!salesMap.has(row.id)) {
            salesMap.set(
               row.id,
               this.mapToEntity(
                  {
                     id: row.id,
                     totalAmount: row.totalAmount,
                     soldAt: row.soldAt,
                  },
                  [] as SaleItem[],
               ),
            );
         }

         if (row.items) {
            const sale = salesMap.get(row.id)!;
            // row.items might be an array or a single object depending on Drizzle version,
            // but usually in this join it returns an array of items
            if (Array.isArray(row.items)) {
               sale.items.push(
                  ...row.items.map((item) => ({
                     productId: item.productId,
                     quantity: item.quantity,
                     priceAtSale: Number(item.priceAtSale),
                  })),
               );
            } else {
               // Handle case where only one item exists
               sale.items.push({
                  productId: row.items.productId,
                  quantity: row.items.quantity,
                  priceAtSale: Number(row.items.priceAtSale),
               });
            }
         }
      }

      return Array.from(salesMap.values());
   }

   async findById(id: number): Promise<Sale | null> {
      // We fetch all rows that match this ID.
      // If there are 3 items, this will return 3 rows.
      const rows = await db
         .select({
            id: salesTable.id,
            totalAmount: salesTable.totalAmount,
            soldAt: salesTable.soldAt,
            items: saleItemsTable,
         })
         .from(salesTable)
         .leftJoin(saleItemsTable, eq(salesTable.id, saleItemsTable.saleId))
         .where(eq(salesTable.id, id));

      if (rows.length === 0) return null;

      // We use a Map or a simple loop to aggregate the items from all returned rows
      const saleMap = new Map<number, Sale>();

      for (const row of rows) {
         if (!saleMap.has(row.id)) {
            saleMap.set(
               row.id,
               this.mapToEntity(
                  {
                     id: row.id,
                     totalAmount: row.totalAmount,
                     soldAt: row.soldAt,
                  },
                  [] as SaleItem[],
               ),
            );
         }

         if (row.items) {
            const sale = saleMap.get(row.id)!;
            // Since we are iterating over all rows for this ID,
            // this will now pick up every item associated with the sale.
            if (Array.isArray(row.items)) {
               sale.items.push(
                  ...row.items.map((item) => ({
                     productId: item.productId,
                     quantity: item.quantity,
                     priceAtSale: Number(item.priceAtSale),
                  })),
               );
            } else {
               sale.items.push({
                  productId: row.items.productId,
                  quantity: row.items.quantity,
                  priceAtSale: Number(row.items.priceAtSale),
               });
            }
         }
      }

      return saleMap.get(id) || null;
   }

   private mapToEntity(saleData: SaleRow, items: SaleItem[]): Sale {
      return new Sale(
         saleData.id,
         items,
         Number(saleData.totalAmount),
         saleData.soldAt ? new Date(saleData.soldAt) : undefined,
      );
   }
}
