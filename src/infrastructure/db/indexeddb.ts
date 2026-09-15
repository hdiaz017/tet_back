// src/infrastructure/db/indexeddb.ts

import Dexie, { type Table } from 'dexie';

// ✅ ProductRecord: id es UUID (string)
export interface ProductRecord {
   id: string; // UUID
   name: string;
   description: string;
   price: number;
   stockQuantity: number;
   category: string;
   image: string;
   updatedAt: string;
}

// ✅ SaleRecord: con tracking de sincronización
export interface SaleRecord {
   id: string; // UUID generado por POS
   totalAmount: number;
   soldAt: string;
   syncStatus: 'pending' | 'synced' | 'failed'; // ← NUEVO
   syncError?: string; // ← NUEVO (por qué falló)
   attempts: number; // ← NUEVO (reintentos)
}

// ✅ SaleItemRecord: sin cambios (ya bien)
export interface SaleItemRecord {
   id: string;
   saleId: string; // FK → SaleRecord.id
   productId: string; // FK → ProductRecord.id
   quantity: number;
   priceAtSale: number;
}

// ✅ CreateSalePayload: renombrado a externalSaleId
export interface CreateSalePayload {
   externalSaleId: string; // ← Renombrado (ID del POS)
   totalAmount: number;
   soldAt: string;
   items: {
      productId: string;
      quantity: number;
      priceAtSale: number;
   }[];
}

// ✅ SyncStatus: agregado 'synced'
export type SyncStatus = 'pending' | 'processing' | 'synced' | 'failed';

// ✅ SyncQueueItem: con tracking completo
export interface SyncQueueItem {
   id: string; // UUID único del queue item
   action: 'CREATE_SALE';
   payload: CreateSalePayload;
   createdAt: string;
   status: SyncStatus;
   attempts: number;
   lastError?: string; // ← NUEVO
   lastAttemptAt?: string; // ← NUEVO
}

export class AppDatabase extends Dexie {
   products!: Table<ProductRecord, string>;
   sales!: Table<SaleRecord, string>;
   saleItems!: Table<SaleItemRecord, string>;
   syncQueue!: Table<SyncQueueItem, string>;

   constructor() {
      super('store-db');
      this.version(1).stores({
         // products: indexados por id y fecha actualización
         products: 'id, updatedAt',

         // sales: indexados por id, fecha y sincronización
         sales: 'id, soldAt, syncStatus', // ← Agregué syncStatus

         // saleItems: indexados por id, sale y producto
         saleItems: 'id, saleId, productId',

         // syncQueue: indexados por id, estado y fecha
         syncQueue: 'id, status, createdAt',
      });
   }
}

export const db = new AppDatabase();
