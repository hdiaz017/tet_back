import type { Request, Response } from 'express';
import { CreateProductUseCase } from '../../core/use-cases/create_product';
import { UpdateProductUseCase } from '../../core/use-cases/update_product';
import { DrizzleProductRepository } from '../../infrastructure/repositories/product.repository';

export class ProductController {
   private createProductUseCase: CreateProductUseCase;
   private updateProductUseCase: UpdateProductUseCase;

   constructor() {
      const productRepo = new DrizzleProductRepository();
      this.createProductUseCase = new CreateProductUseCase(productRepo);
      this.updateProductUseCase = new UpdateProductUseCase(productRepo);
   }

   public createProduct = async (req: Request, res: Response) => {
      try {
         const { name, description, price, stockQuantity, category } = req.body;

         const product = await this.createProductUseCase.execute({
            name,
            description,
            price,
            stockQuantity,
            category,
         });

         return res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: product,
         });
      } catch (error: any) {
         return res.status(400).json({
            success: false,
            message: error.message,
         });
      }
   };

   public updateProduct = async (req: Request, res: Response) => {
      try {
         const { id } = req.params;
         const { name, description, price, stockQuantity, category } = req.body;

         const updatedProduct = await this.updateProductUseCase.execute(
            Number(id),
            {
               name,
               description,
               price,
               stockQuantity,
               category,
            },
         );

         return res.status(200).json({
            success: true,
            message: 'Product updated successfully',
            data: updatedProduct,
         });
      } catch (error: any) {
         return res.status(400).json({
            success: false,
            message: error.message,
         });
      }
   };
}
