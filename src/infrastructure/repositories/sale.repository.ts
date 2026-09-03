import { db } from '../database/db';
import { sales as salesTable, saleItems as saleItemsTable } from '../db/schema';
import { Sale } from '../../core/entities/sale';
import type { SaleRepository } from '../../core/repositories/sale.repository';
import { eq } from 'drizzle-orm';

export class DrizzleSaleRepository implements SaleRepository {
   async create(sale: Sale): Promise<Sale> {
      // 1. Insert into sales table
      const [newSale] = await db
         .insert(salesTable)
         .values({
            totalAmount: sale.totalAmount,
            soldAt: sale.soldAt,
         })
         .returning();

      // 2. Insert into sale_items table
      const itemsToInsert = sale.items.map((item) => ({
         saleId: newSale.id,
         productId: item.productId,
         quantity: item.quantity,
         priceAtSale: item.priceAtSale,
      }));

      await db.insert(saleItemsTable).values(itemsToInsert);

      return this.mapToEntity(newSale, sale.items);
   }

   async findAll(): Promise<Sale[]> {
      const allSales = await db.select().from(salesTable);
      return allSales.map(this.mapToEntity);
   }

   async findById(id: number): Promise<Sale | null> {
      const [sale] = await db
         .select()
         .from(salesTable)
         .where(eq(salesTable.id, id));
      if (!sale) return null;
      return this.mapToEntity(sale, []);
   }

   private mapToEntity(saleData: any, items: any[]): Sale {
      return new Sale(
         saleData.id,
         items,
         Number(saleData.totalAmount),
         saleData.soldAt,
      );
   }
}
