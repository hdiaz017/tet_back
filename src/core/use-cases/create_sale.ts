import { Sale } from '../entities/sale';
import type { SaleRepository } from '../repositories/sale.repository';
import type { CreateSaleCommand } from './create_sale.command';

export class CreateSaleUseCase {
   constructor(private saleRepository: SaleRepository) {}

   async execute(command: CreateSaleCommand): Promise<Sale> {
      // 1️⃣ VALIDAR COMMAND (validaciones básicas)
      this.validateCommand(command);

      // 2️⃣ CREAR DOMAIN ENTITY
      const sale = new Sale(
         command.externalSaleId, // ← El ID del POS
         command.items,
         command.totalAmount,
         undefined, // id se genera en DB
         command.soldAt,
      );

      sale.validate();
      const savedSale = await this.saleRepository.create(sale);
      return savedSale;
   }

   /**
    * Validar que el comando tiene todo lo necesario
    */
   private validateCommand(command: CreateSaleCommand): void {
      if (!command.externalSaleId || command.externalSaleId.trim() === '') {
         throw new Error('externalSaleId is required');
      }

      if (!command.items || command.items.length === 0) {
         throw new Error('Sale must have at least one item');
      }

      if (command.totalAmount <= 0) {
         throw new Error('totalAmount must be positive');
      }

      // Validar que items tienen campos necesarios
      for (const item of command.items) {
         if (!item.productId) {
            throw new Error('Item productId is required');
         }
         if (item.quantity <= 0) {
            throw new Error('Item quantity must be greater than 0');
         }
         if (item.priceAtSale < 0) {
            throw new Error('Item priceAtSale cannot be negative');
         }
      }
   }
}
