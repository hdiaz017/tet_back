import type { Request, Response } from 'express';
import { CreateSaleUseCase } from '../../core/use-cases/create_sale';
import type { CreateSaleCommand } from '../../core/use-cases/create_sale.command';

import { DrizzleSaleRepository } from '../../infrastructure/repositories/sale.repository';
import { GetSaleUseCase } from '../../core/use-cases/get_sale';
import { GetSalesUseCase } from '../../core/use-cases/get_sales';
export class SaleController {
   private createSaleUseCase: CreateSaleUseCase;
   private getAllSalesUseCase: GetSalesUseCase;
   private getSaleUseCase: GetSaleUseCase;

   constructor() {
      // Wiring up dependencies

      const saleRepo = new DrizzleSaleRepository();
      this.createSaleUseCase = new CreateSaleUseCase(saleRepo);
      this.getAllSalesUseCase = new GetSalesUseCase(saleRepo);
      this.getSaleUseCase = new GetSaleUseCase(saleRepo);
   }

   public createSale = async (req: Request, res: Response) => {
      try {
         const { externalSaleId, items, totalAmount, soldAt } = req.body;

         // ✅ Validar DTO
         if (!externalSaleId || !items || !totalAmount) {
            res.status(400).json({
               success: false,
               message: 'externalSaleId, items, and totalAmount are required',
            });
            return;
         }

         // ✅ Convertir a CreateSaleCommand
         const command: CreateSaleCommand = {
            externalSaleId,
            items,
            totalAmount,
            soldAt: soldAt ? new Date(soldAt) : undefined,
         };
         // ✅ Ejecutar use case
         const sale = await this.createSaleUseCase.execute(command);

         // ✅ Responder 201 (creada)
         res.status(201).json({
            success: true,
            message: 'Sale created successfully',
            data: sale.toPrimitives?.() || sale,
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
            data: sales.map((sale) => sale.toPrimitives?.() || sale),
         });
      } catch (error: any) {
         console.error('Error in getAllSales:', error);
         res.status(500).json({
            success: false,
            message: error.message || 'Internal server error',
         });
      }
   };

   public getSale = async (req: Request<{ id: string }>, res: Response) => {
      try {
         // ✅ ID es UUID (string), no number
         const id = req.params.id;

         if (!id) {
            res.status(400).json({
               success: false,
               message: 'Sale ID is required',
            });
            return;
         }
         const sale = await this.getSaleUseCase.execute(id);
         if (!sale) {
            res.status(404).json({
               success: false,
               message: 'Sale not found',
            });
            return;
         }

         res.status(200).json({
            success: true,
            data: sale.toPrimitives?.() || sale,
         });
      } catch (error: any) {
         console.error('Error in getSale:', error);
         res.status(500).json({
            success: false,
            message: error.message || 'Internal server error',
         });
      }
   };

   public getSaleByExternalId = async (
      req: Request,
      res: Response,
   ): Promise<void> => {
      try {
         const externalSaleId = req.params.externalSaleId;

         if (!externalSaleId) {
            res.status(400).json({
               success: false,
               message: 'externalSaleId is required',
            });
            return;
         }

         const sale = await (this as any).saleRepo.findByExternalSaleId(
            externalSaleId,
         );

         if (!sale) {
            res.status(404).json({
               success: false,
               message: 'Sale not found',
            });
            return;
         }

         res.status(200).json({
            success: true,
            data: sale.toPrimitives?.() || sale,
         });
      } catch (error: any) {
         console.error('Error in getSaleByExternalId:', error);
         res.status(500).json({
            success: false,
            message: error.message || 'Internal server error',
         });
      }
   };
}
