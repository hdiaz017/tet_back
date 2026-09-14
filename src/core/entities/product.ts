export class Product {
   constructor(
      public readonly id: string, // UUID (nunca undefined)
      public readonly name: string,
      public readonly description: string,
      public readonly price: number, // En centavos o validado
      private stockQuantity: number, // Privado (no readonly)
      public readonly category: string,
      public readonly image: string,
      public readonly createdAt: Date, // ✅ NUEVO
      public readonly updatedAt: Date,
   ) {}

   // Getter to access the private stock quantity
   get getStockQuantity(): number {
      return this.stockQuantity;
   }

   // Business Logic: Update stock when sold
   public reduceStock(quantity: number): void {
      if (this.stockQuantity < quantity) {
         throw new Error('Insufficient stock');
      }
      this.stockQuantity -= quantity;
   }
}
