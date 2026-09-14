import { db } from '../db/db';
import {
   sales as salesTable,
   saleItems as saleItemsTable,
   products as productsTable,
} from '../db/schema';
import { Sale, type SaleItem } from '../../core/entities/sale';
import type { SaleRepository } from '../../core/repositories/sale.repository';
import { eq, inArray } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

interface SaleRow {
   id: string; // UUID
   externalSaleId: string;
   totalAmount: string;
   soldAt: Date;
}

interface ProductRow {
   id: string;
   name: string;
   stockQuantity: number;
}

interface SaleItemRow {
   productId: string;
   quantity: number;
   priceAtSale: string;
}

interface SaleWithItemsRow {
   id: string;
   externalSaleId: string;
   totalAmount: string;
   soldAt: Date;
   // Join fields (pueden ser null)
   itemId: string | null;
   productId: string | null;
   quantity: number | null;
   priceAtSale: string | null;
}

export class DrizzleSaleRepository implements SaleRepository {
   /**
    * Crear una venta con idempotencia y validación completa en transacción
    */
   async create(sale: Sale): Promise<Sale> {
      return await db.transaction(async (tx) => {
         // 1️⃣ DETECTAR DUPLICADO por externalSaleId
         const existing: SaleRow[] = await tx
            .select({
               id: salesTable.id,
               externalSaleId: salesTable.externalSaleId,
               totalAmount: salesTable.totalAmount,
               soldAt: salesTable.soldAt,
            })
            .from(salesTable)
            .where(eq(salesTable.externalSaleId, sale.externalSaleId))
            .limit(1);

         if (existing.length > 0) {
            const existingSale = existing.at(0);
            if (!existingSale) {
               throw new Error('Sale not found'); // o return null
            }
            // La venta ya existe → retornar como si fuera nueva (idempotente)
            const existingItems: SaleItemRow[] = await tx
               .select({
                  productId: saleItemsTable.productId,
                  quantity: saleItemsTable.quantity,
                  priceAtSale: saleItemsTable.priceAtSale,
               })
               .from(saleItemsTable)
               .where(eq(saleItemsTable.saleId, existingSale.id));

            return new Sale(
               existingSale.externalSaleId,
               existingItems.map((item) => ({
                  productId: item.productId,
                  quantity: item.quantity,
                  priceAtSale: Number(item.priceAtSale),
               })),
               Number(existingSale.totalAmount),
               existingSale.id,
               existingSale.soldAt,
            );
         }

         // 2️⃣ VALIDAR Y CARGAR PRODUCTOS
         const productIds = sale.items.map((item) => item.productId);
         const products: ProductRow[] = await tx
            .select()
            .from(productsTable)
            .where(inArray(productsTable.id, productIds));

         if (products.length !== productIds.length) {
            throw new Error('One or more products not found');
         }

         // 3️⃣ VALIDAR STOCK
         for (const item of sale.items) {
            const product = products.find((p) => p.id === item.productId);
            if (!product) {
               throw new Error(`Product not found: ${item.productId}`);
            }
            if (product.stockQuantity < item.quantity) {
               throw new Error(
                  `Insufficient stock for product ${product.name}. ` +
                     `Available: ${product.stockQuantity}, Requested: ${item.quantity}`,
               );
            }
         }

         // 4️⃣ CREAR SALE
         const newSaleResult: SaleRow[] = await tx
            .insert(salesTable)
            .values({
               externalSaleId: sale.externalSaleId,
               totalAmount: sale.totalAmount.toString(),
               soldAt: sale.soldAt ?? new Date(),
            })
            .returning({
               id: salesTable.id,
               externalSaleId: salesTable.externalSaleId,
               totalAmount: salesTable.totalAmount,
               soldAt: salesTable.soldAt,
            });

         const newSale = newSaleResult.at(0); // ✅ TypeScript sabe que es SaleRow
         if (!newSale) {
            throw new Error('Failed to create sale record'); // o return null
         }

         // 5️⃣ CREAR SALE_ITEMS
         const itemsToInsert = sale.items.map((item) => ({
            saleId: newSale.id,
            productId: item.productId,
            quantity: item.quantity,
            priceAtSale: item.priceAtSale.toString(),
         }));

         await tx.insert(saleItemsTable).values(itemsToInsert);

         // 6️⃣ ACTUALIZAR STOCK EN PRODUCTOS
         for (const item of sale.items) {
            await tx
               .update(productsTable)
               .set({
                  stockQuantity: sql`${productsTable.stockQuantity} - ${item.quantity}`,
               })
               .where(eq(productsTable.id, item.productId));
         }

         // Retornar Sale reconstructida
         return new Sale(
            newSale.externalSaleId,
            sale.items,
            sale.totalAmount,
            newSale.id,
            newSale.soldAt,
         );
      });
   }

   /**
    * Buscar por externalSaleId (para validar antes de crear)
    */
   async findByExternalSaleId(externalSaleId: string): Promise<Sale | null> {
      const rows: SaleWithItemsRow[] = await db
         .select({
            id: salesTable.id,
            externalSaleId: salesTable.externalSaleId,
            totalAmount: salesTable.totalAmount,
            soldAt: salesTable.soldAt,
            itemId: saleItemsTable.id,
            productId: saleItemsTable.productId,
            quantity: saleItemsTable.quantity,
            priceAtSale: saleItemsTable.priceAtSale,
         })
         .from(salesTable)
         .leftJoin(saleItemsTable, eq(salesTable.id, saleItemsTable.saleId))
         .where(eq(salesTable.externalSaleId, externalSaleId));

      if (rows.length === 0) return null;

      const [firstRow] = rows;
      if (!firstRow) return null;
      const items: SaleItem[] = rows
         .filter((row) => row.itemId !== null)
         .map((row) => ({
            productId: row.productId ?? '',
            quantity: row.quantity ?? 0,
            priceAtSale: Number(row.priceAtSale ?? 0),
         }));

      return new Sale(
         firstRow.externalSaleId,
         items,
         Number(firstRow.totalAmount),
         firstRow.id,
         firstRow.soldAt,
      );
   }

   /**
    * Buscar por ID (UUID)
    */
   async findById(id: string): Promise<Sale | null> {
      const rows: SaleWithItemsRow[] = await db
         .select({
            id: salesTable.id,
            externalSaleId: salesTable.externalSaleId,
            totalAmount: salesTable.totalAmount,
            soldAt: salesTable.soldAt,
            itemId: saleItemsTable.id,
            productId: saleItemsTable.productId,
            quantity: saleItemsTable.quantity,
            priceAtSale: saleItemsTable.priceAtSale,
         })
         .from(salesTable)
         .leftJoin(saleItemsTable, eq(salesTable.id, saleItemsTable.saleId))
         .where(eq(salesTable.id, id));

      if (rows.length === 0) return null;

      const [firstRow] = rows;
      if (!firstRow) return null;
      const items: SaleItem[] = rows
         .filter((row) => row.itemId !== null)
         .map((row) => ({
            productId: row.productId ?? '',
            quantity: row.quantity ?? 0,
            priceAtSale: Number(row.priceAtSale ?? 0),
         }));

      return new Sale(
         firstRow.externalSaleId,
         items,
         Number(firstRow.totalAmount),
         firstRow.id,
         firstRow.soldAt,
      );
   }

   /**
    * Buscar todas las ventas
    */
   async findAll(): Promise<Sale[]> {
      const rows: SaleWithItemsRow[] = await db
         .select({
            id: salesTable.id,
            externalSaleId: salesTable.externalSaleId,
            totalAmount: salesTable.totalAmount,
            soldAt: salesTable.soldAt,
            itemId: saleItemsTable.id,
            productId: saleItemsTable.productId,
            quantity: saleItemsTable.quantity,
            priceAtSale: saleItemsTable.priceAtSale,
         })
         .from(salesTable)
         .leftJoin(saleItemsTable, eq(salesTable.id, saleItemsTable.saleId));

      const salesMap = new Map<string, Sale>();

      for (const row of rows) {
         if (!salesMap.has(row.id)) {
            salesMap.set(
               row.id,
               new Sale(
                  row.externalSaleId,
                  [],
                  Number(row.totalAmount),
                  row.id,
                  row.soldAt,
               ),
            );
         }

         if (row.itemId) {
            const sale = salesMap.get(row.id)!;
            sale['items'].push({
               productId: row.productId ?? '',
               quantity: row.quantity ?? 0,
               priceAtSale: Number(row.priceAtSale ?? 0),
            });
         }
      }

      return Array.from(salesMap.values());
   }
}
