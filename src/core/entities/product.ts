export class Product {
   constructor(
      public readonly name: string,
      public readonly description: string,
      public readonly price: number,
      private _stockQuantity: number,
      public readonly category: string,
      public readonly id?: number,
   ) {}

   // Getter to access the private stock quantity
   get stockQuantity(): number {
      return this._stockQuantity;
   }

   // Business Logic: Update stock when sold
   public reduceStock(quantity: number): void {
      if (this._stockQuantity < quantity) {
         throw new Error('Insufficient stock');
      }
      this._stockQuantity -= quantity;
   }
}
