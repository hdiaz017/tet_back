import { Sale } from '../entities/sale';
import type { SaleRepository } from '../repositories/sale.repository';

export class GetSaleExternalUseCase {
   constructor(private saleRepository: SaleRepository) {}

   async execute(id: string): Promise<Sale> {
      if (!id || id.trim() === '') {
         throw new Error('Sale ID is required');
      }
      const sale = await this.saleRepository.findByExternalSaleId(id);
      if (!sale) {
         throw new Error('Sale not found');
      }
      return sale;
   }
}
