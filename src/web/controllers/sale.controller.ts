import type { Request, Response } from 'express';
import { CreateSaleUseCase } from '../../core/use-cases/create_sale';
import { DrizzleProductRepository } from '../../infrastructure/repositories/product.repository';
import { DrizzleSaleRepository } from '../../infrastructure/repositories/sale.repository';
import { GetSaleUseCase } from '../../core/use-cases/get_sale';
import { GetSalesUseCase } from '../../core/use-cases/get_sales';
export class SaleController {
   private createSaleUseCase: CreateSaleUseCase;
   private getAllSalesUseCase: GetSalesUseCase;
   private getSaleUseCase: GetSaleUseCase;

   constructor() {
      // Wiring up dependencies
      const productRepo = new DrizzleProductRepository();
      const saleRepo = new DrizzleSaleRepository();
      this.createSaleUseCase = new CreateSaleUseCase(productRepo, saleRepo);
      this.getAllSalesUseCase = new GetSalesUseCase(saleRepo);
      this.getSaleUseCase = new GetSaleUseCase(saleRepo);
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

   public getAllSales = async (req: Request, res: Response) => {
      try {
         const sales = await this.getAllSalesUseCase.execute();
         return res.status(200).json({
            success: true,
            data: sales,
         });
      } catch (error: any) {
         return res.status(400).json({
            success: false,
            message: error.message,
         });
      }
   };

   public getSale = async (req: Request, res: Response) => {
      try {
         const sale = await this.getSaleUseCase.execute(Number(req.params.id));
         return res.status(200).json({
            success: true,
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
