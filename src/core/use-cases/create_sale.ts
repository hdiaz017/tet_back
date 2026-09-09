import { Sale, type SaleItem } from '../entities/sale';
import type { ProductRepository } from '../repositories/product.repository';
import type { SaleRepository } from '../repositories/sale.repository';

export class CreateSaleUseCase {
   constructor(
      private productRepository: ProductRepository,
      private saleRepository: SaleRepository,
   ) {}

   async execute(items: SaleItem[]): Promise<Sale> {
      let totalAmount = 0;

      // 1. Validate products and calculate total
      for (const item of items) {
         const product = await this.productRepository.findById(item.productId);
         if (!product) {
            throw new Error(`Product with ID ${item.productId} not found`);
         }

         if (product.stockQuantity < item.quantity) {
            throw new Error(`Insufficient stock for product: ${product.name}`);
         }

         totalAmount += item.priceAtSale * item.quantity;
      }

      // 2. Create the Sale
      const sale = new Sale(items, totalAmount, new Date());
      const savedSale = await this.saleRepository.create(sale);

      // 3. Update stock for each item
      for (const item of items) {
         const product = await this.productRepository.findById(item.productId)!;
         if (product) {
            product.reduceStock(item.quantity);
            await this.productRepository.update(product);
         }
      }

      return savedSale;
   }
}
