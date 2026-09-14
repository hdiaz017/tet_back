export interface SaleItem {
   productId: string;
   quantity: number;
   priceAtSale: number;
}

export class Sale {
   constructor(
      public readonly externalSaleId: string, // ← NUEVO (del POS)
      public readonly items: SaleItem[],
      public readonly totalAmount: number,
      public readonly id?: string, // UUID generado en DB
      public readonly soldAt?: Date, // Timestamp
   ) {}

   // Helper to calculate total
   public calculateTotal(): number {
      return this.items.reduce(
         (sum, item) => sum + item.priceAtSale * item.quantity,
         0,
      );
   }

   public validate(): void {
      if (!this.externalSaleId) {
         throw new Error('externalSaleId is required');
      }
      if (this.items.length === 0) {
         throw new Error('Sale must have at least one item');
      }
      if (this.totalAmount <= 0) {
         throw new Error('totalAmount must be positive');
      }
      // Verificar que calculateTotal() coincide
      const calculated = this.calculateTotal();
      if (Math.abs(calculated - this.totalAmount) > 0.01) {
         throw new Error('totalAmount does not match calculated total');
      }
   }
}
