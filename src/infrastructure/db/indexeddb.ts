import Dexie, { type Table } from 'dexie';

export interface ProductRecord {
   id: number;
   name: string;
   description: string;
   price: number;
   stockQuantity: number;
   category: string;
   updatedAt: string;
}

export interface SaleRecord {
   id: string;
   totalAmount: number;
   soldAt: string;
}

export interface SaleItemRecord {
   id: string;
   saleId: string;
   productId: string;
   quantity: number;
   priceAtSale: number;
}

export interface CreateSalePayload {
   saleId: string;
   totalAmount: number;
   soldAt: string;
   items: {
      productId: string;
      quantity: number;
      priceAtSale: number;
   }[];
}

export type SyncStatus = 'pending' | 'processing' | 'failed';

export interface SyncQueueItem {
   id: string;
   action: 'CREATE_SALE';
   payload: CreateSalePayload;
   createdAt: string;
   status: SyncStatus;
   attempts: number;
}

export class AppDatabase extends Dexie {
   products!: Table<ProductRecord, string>;
   sales!: Table<SaleRecord, string>;
   saleItems!: Table<SaleItemRecord, string>;
   syncQueue!: Table<SyncQueueItem, string>;

   constructor() {
      super('store-db');
      this.version(1).stores({
         products: 'id, updatedAt',
         sales: 'id, soldAt',
         saleItems: 'id, saleId, productId',
         syncQueue: 'id, status, createdAt',
      });
   }
}

export const db = new AppDatabase();
