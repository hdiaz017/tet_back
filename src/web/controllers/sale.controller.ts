import type { Request, Response } from 'express';
import { CreateSaleUseCase } from '../../core/use-cases/create_sale';
import { DrizzleProductRepository } from '../../infrastructure/repositories/product.repository';
import { DrizzleSaleRepository } from '../../infrastructure/repositories/sale.repository';

export class SaleController {
   private createSaleUseCase: CreateSaleUseCase;

   constructor() {
      // Wiring up dependencies
      const productRepo = new DrizzleProductRepository();
      const saleRepo = new DrizzleSaleRepository();
      this.createSaleUseCase = new CreateSaleUseCase(productRepo, saleRepo);
   }

   public createSale = async (req: Request, res: Response) => {
      try {
         const { items } = req.body as { items: any[] };

         // The Use Case handles all the business logic
         const sale = await this.createSaleUseCase.execute(items);

         return res.status(201).json({
            success: true,
            message: 'Sale created successfully',
            data: sale,
         });
      } catch (error: any) {
         return res.status(400).json({
            success: false,
            message: error.message,
         });
      }
   };
}
