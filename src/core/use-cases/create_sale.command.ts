// src/core/use-cases/create-sale/create-sale.command.ts

import type { SaleItem } from '../entities/sale';

export interface CreateSaleCommand {
   externalSaleId: string; // ID del POS
   items: SaleItem[]; // Productos
   totalAmount: number; // Total calculado por POS
   soldAt?: Date | undefined; // Timestamp (opcional)
}
