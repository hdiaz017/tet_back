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
      const allSales = await db.select().from(salesTable);
      return allSales.map((saleData) => this.mapToEntity(saleData, []));
   }

   async findById(id: number): Promise<Sale | null> {
      const [sale] = await db
         .select()
         .from(salesTable)
         .where(eq(salesTable.id, id));
      if (!sale) return null;
      return this.mapToEntity(sale, []);
   }

   private mapToEntity(saleData: SaleRow, items: SaleItem[]): Sale {
      return new Sale(
         items,
         Number(saleData.totalAmount),
         saleData.soldAt ? new Date(saleData.soldAt) : undefined,
      );
   }
}
