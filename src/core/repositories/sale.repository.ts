import { Sale } from '../entities/sale';

export interface SaleRepository {
   create(sale: Sale): Promise<Sale>;
   findAll(): Promise<Sale[]>;
   findById(id: string): Promise<Sale | null>;
}
