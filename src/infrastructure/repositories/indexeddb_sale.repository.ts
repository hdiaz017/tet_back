import { Sale } from '../../core/entities/sale';
import type { SaleRepository } from '../../core/repositories/sale.repository';

import {
   db,
   type SaleItemRecord,
   type CreateSalePayload,
} from '../db/indexeddb';

export class IndexedDbSaleRepository implements SaleRepository {
   async create(sale: Sale): Promise<Sale> {
      const saleId = sale.id!;
      const soldAt = new Date().toISOString();

      // Validate Unique Products in Sale
      const productIds = new Set(sale.items.map((i) => i.productId));
      if (productIds.size !== sale.items.length) {
         throw new Error('Sale contains duplicate products');
      }

      return await db.transaction(
         'rw',
         [db.sales, db.saleItems, db.products, db.syncQueue],
         async (tx) => {
            // 1. Insert Sale Record
            await tx.sales.add({
               id: saleId,
               totalAmount: sale.totalAmount,
               soldAt: soldAt,
            });

            // 2. Insert Sale Items
            const itemsToInsert: SaleItemRecord[] = sale.items.map((item) => ({
               id: crypto.randomUUID(),
               saleId: saleId,
               productId: item.productId,
               quantity: item.quantity,
               priceAtSale: item.priceAtSale,
            }));
            await tx.saleItems.bulkAdd(itemsToInsert);

            // 3. Validate and Update local stock
            for (const item of sale.items) {
               const product = await tx.products.get(item.productId);
               if (!product)
                  throw new Error(`Product ${item.productId} not found`);

               if (product.stockQuantity < item.quantity) {
                  throw new Error(
                     `Insufficient stock for product ${item.productId}`,
                  );
               }

               await tx.products.update(item.productId, {
                  stockQuantity: product.stockQuantity - item.quantity,
               });
            }

            // 4. Add to Sync Queue
            const syncPayload: CreateSalePayload = {
               saleId,
               totalAmount: sale.totalAmount,
               soldAt,
               items: sale.items.map((i) => ({
                  productId: i.productId,
                  quantity: i.quantity,
                  priceAtSale: i.priceAtSale,
               })),
            };

            await tx.syncQueue.add({
               id: crypto.randomUUID(),
               action: 'CREATE_SALE',
               payload: syncPayload,
               createdAt: soldAt,
               status: 'pending',
               attempts: 0,
            });

            return sale;
         },
      );
   }

   async findById(id: string): Promise<Sale | null> {
      const record = await db.sales.get(id);
      if (!record) return null;

      const items = await db.saleItems.where('saleId').equals(id).toArray();
      return new Sale(
         record.id,
         items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            priceAtSale: i.priceAtSale,
         })),
         record.totalAmount,
         new Date(record.soldAt),
      );
   }

   async findAll(): Promise<Sale[]> {
      const records = await db.sales.orderBy('soldAt').reverse().toArray();
      const sales = await Promise.all(
         records.map(async (record) => {
            const items = await db.saleItems
               .where('saleId')
               .equals(record.id)
               .toArray();
            return new Sale(
               record.id,
               items.map((i) => ({
                  productId: i.productId,
                  quantity: i.quantity,
                  priceAtSale: i.priceAtSale,
               })),
               record.totalAmount,
               new Date(record.soldAt),
            );
         }),
      );
      return sales;
   }
}
