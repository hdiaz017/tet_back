export class Product {
  constructor(
    public readonly id?: number,
    public readonly name: string,
    public readonly description: string,
    public readonly price: number,
    public readonly stockQuantity: number,
    public readonly category: string,
    public readonly isActive: boolean = true
  ) {}

  // Business Logic: Update stock when sold
  public reduceStock(quantity: number): void {
    if (this.stockQuantity < quantity) {
      throw new Error('Insufficient stock');
    }
    this.stockQuantity -= quantity;
  }
}