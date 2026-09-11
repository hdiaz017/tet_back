export interface SaleItem {
   productId: string;
   quantity: number;
   priceAtSale: number;
}

export class Sale {
   constructor(
      public readonly id?: string,
      public readonly items: SaleItem[],
      public readonly totalAmount: number,
      public readonly soldAt?: Date,
   ) {}

   // Helper to calculate total
   public calculateTotal(): number {
      return this.items.reduce(
         (sum, item) => sum + item.priceAtSale * item.quantity,
         0,
      );
   }
}
