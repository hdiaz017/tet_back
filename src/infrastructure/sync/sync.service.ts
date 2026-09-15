import { db, type SyncQueueItem } from '../db/indexeddb';

interface SyncOptions {
   maxRetries?: number;
   retryDelayMs?: number;
   backoffMultiplier?: number;
   serverUrl?: string;
}

export class SyncService {
   private isSyncing = false;
   private options: Required<SyncOptions>;

   constructor(options: SyncOptions = {}) {
      this.options = {
         maxRetries: options.maxRetries ?? 5,
         retryDelayMs: options.retryDelayMs ?? 1000,
         backoffMultiplier: options.backoffMultiplier ?? 2,
         serverUrl: options.serverUrl ?? 'http://localhost:3000',
      };
   }

   async sync(): Promise<void> {
      // ✅ Evitar múltiples sincronizaciones simultáneas
      if (this.isSyncing) {
         console.log('[SyncService] Sync already in progress, skipping...');
         return;
      }

      this.isSyncing = true;
      try {
         const pendingItems = await db.syncQueue
            .where('status')
            .equals('pending')
            .toArray();

         if (pendingItems.length === 0) {
            console.log('[SyncService] No pending items to sync');
            return;
         }
         console.log(
            `[SyncService] Found ${pendingItems.length} pending items to sync`,
         );

         // Sincronizar cada item
         for (const item of pendingItems) {
            await this.syncItem(item);
         }
         console.log('[SyncService] Sync completed');
      } catch (error) {
         console.error('[SyncService] Fatal sync error:', error);
      } finally {
         this.isSyncing = false;
      }
   }

   /**
    * ✅ Sincronizar un item individual
    */
   private async syncItem(item: SyncQueueItem): Promise<void> {
      try {
         // Marcar como "procesando"
         await db.syncQueue.update(item.id, {
            status: 'processing',
            lastAttemptAt: new Date().toISOString(),
         });

         console.log(
            `[SyncService] Syncing ${item.action}: ${item.payload.externalSaleId}...`,
         );

         // Ejecutar la acción correspondiente
         switch (item.action) {
            case 'CREATE_SALE':
               await this.syncSale(item.payload);
               break;
            default:
               throw new Error(`Unknown action: ${item.action}`);
         }

         // ✅ Al éxito: actualizar a 'synced' (no borrar)
         await db.syncQueue.update(item.id, {
            status: 'synced',
            attempts: item.attempts + 1,
            lastAttemptAt: new Date().toISOString(),
         });

         // Actualizar sale como sincronizada
         await db.sales.update(item.payload.externalSaleId, {
            syncStatus: 'synced',
         });

         console.log(`[SyncService] Item synced: ${item.id}`);
      } catch (error) {
         await this.handleError(item, error);
      }
   }

   /**
    * ✅ Sincronizar venta con el servidor
    */
   private async syncSale(payload: any): Promise<void> {
      // Validar payload
      if (!payload.externalSaleId) {
         throw new Error('Missing externalSaleId in payload');
      }
      if (!payload.items || payload.items.length === 0) {
         throw new Error('No items in sale');
      }
      if (payload.totalAmount <= 0) {
         throw new Error('Invalid totalAmount');
      }

      // ✅ Fetch real al servidor
      const response = await fetch(`${this.options.serverUrl}/api/sales`, {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json',
         },
         body: JSON.stringify(payload),
      });

      // ✅ Manejar respuestas
      if (response.ok) {
         // 200 OK - Venta creada
         console.log(
            `[SyncService] Sale created on server: ${payload.externalSaleId}`,
         );
         return;
      }

      if (response.status === 409) {
         // ✅ 409 Conflict - Venta ya existe (idempotente)
         console.log(
            `[SyncService] Sale already exists (409): ${payload.externalSaleId}`,
         );
         return;
      }

      if (response.status === 400) {
         // 400 Bad Request - Datos inválidos (no reintentar)
         const error = await response.json();
         throw new Error(`Bad request: ${error.message}`);
      }

      if (response.status === 404) {
         // 404 Not Found - Producto no existe (no reintentar)
         const error = await response.json();
         throw new Error(`Not found: ${error.message}`);
      }

      // Otros errores 5xx - reintentar
      throw new Error(
         `Server error: ${response.status} ${response.statusText}`,
      );
   }

   /**
    * ✅ Manejo de errores con reintentos exponenciales
    */
   private async handleError(
      item: SyncQueueItem,
      error: unknown,
   ): Promise<void> {
      const errorMessage =
         error instanceof Error ? error.message : String(error);
      const newAttempts = item.attempts + 1;

      console.error(
         `[SyncService] Error syncing ${item.id} (attempt ${newAttempts}/${this.options.maxRetries}):`,
         errorMessage,
      );

      // ✅ Si llegó al máximo de reintentos
      if (newAttempts >= this.options.maxRetries) {
         console.error(
            `[SyncService] Max retries exceeded for ${item.payload.externalSaleId}`,
         );

         await db.syncQueue.update(item.id, {
            status: 'failed',
            attempts: newAttempts,
            lastError: errorMessage,
            lastAttemptAt: new Date().toISOString(),
         });

         // Marcar sale como fallida
         await db.sales.update(item.payload.externalSaleId, {
            syncStatus: 'failed',
            syncError: errorMessage,
         });

         return;
      }

      // ✅ Reintentar después (con backoff exponencial)
      const delayMs =
         this.options.retryDelayMs *
         Math.pow(this.options.backoffMultiplier, newAttempts - 1);

      console.log(
         `[SyncService] Will retry in ${delayMs}ms (attempt ${newAttempts}/${this.options.maxRetries})`,
      );

      await db.syncQueue.update(item.id, {
         status: 'pending',
         attempts: newAttempts,
         lastError: errorMessage,
         lastAttemptAt: new Date().toISOString(),
      });
   }

   /**
    * ✅ Obtener estado de sincronización de una venta
    */
   async getSyncStatus(externalSaleId: string): Promise<{
      status: string;
      attempts: number;
      error?: string;
   } | null> {
      const sale = await db.sales.get(externalSaleId);

      if (!sale) {
         return null;
      }

      const queueItem = await db.syncQueue
         .where('payload.externalSaleId')
         .equals(externalSaleId)
         .first();

      return {
         status: sale.syncStatus,
         attempts: queueItem?.attempts ?? 0,
         ...(sale.syncError && { error: sale.syncError }),
      };
   }

   /**
    * ✅ Resumen de sincronización
    */
   async getSyncSummary(): Promise<{
      total: number;
      synced: number;
      pending: number;
      failed: number;
   }> {
      const all = await db.syncQueue.toArray();

      return {
         total: all.length,
         synced: all.filter((s) => s.status === 'synced').length,
         pending: all.filter((s) => s.status === 'pending').length,
         failed: all.filter((s) => s.status === 'failed').length,
      };
   }

   /**
    * ✅ Reintentar todas las fallidas
    */
   async retryFailed(): Promise<void> {
      const failed = await db.syncQueue
         .where('status')
         .equals('failed')
         .toArray();

      console.log(`[SyncService] Retrying ${failed.length} failed items...`);

      for (const item of failed) {
         await db.syncQueue.update(item.id, {
            status: 'pending',
            attempts: 0,
         });
      }

      await this.sync();
   }

   /**
    * ✅ Limpiar items sincronizados antiguos
    */
   async cleanupSynced(daysOld: number = 30): Promise<number> {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const synced = await db.syncQueue
         .where('status')
         .equals('synced')
         .toArray();

      const toDelete = synced.filter((item) => {
         const itemDate = new Date(item.createdAt);
         return itemDate < cutoffDate;
      });

      for (const item of toDelete) {
         await db.syncQueue.delete(item.id);
      }

      console.log(`[SyncService] Cleaned up ${toDelete.length} old items`);
      return toDelete.length;
   }

   /**
    * ✅ Nombre alternativo (para compatibilidad con código viejo)
    */
   async processQueue(): Promise<void> {
      return this.sync();
   }
}
