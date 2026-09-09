import { Sale } from '../entities/sale';
import type { SaleRepository } from '../repositories/sale.repository';

export class GetSalesUseCase {
   constructor(private saleRepository: SaleRepository) {}

   async execute(): Promise<Sale[]> {
      return await this.saleRepository.findAll();
   }
}