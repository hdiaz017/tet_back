import { Sale } from '../entities/sale';
import type { SaleRepository } from '../repositories/sale.repository';

export class GetSaleUseCase {
   constructor(private saleRepository: SaleRepository) {}

   async execute(id: number): Promise<Sale> {
      const sale = await this.saleRepository.findById(id);
      if (!sale) {
         throw new Error('Sale not found');
      }
      return sale;
   }
}
