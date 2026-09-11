import type { Request, Response } from 'express';
import { CreateProductUseCase } from '../../core/use-cases/create_product';
import { UpdateProductUseCase } from '../../core/use-cases/update_product';
import { DrizzleProductRepository } from '../../infrastructure/repositories/product.repository';
import { GetProductUseCase } from '../../core/use-cases/get_product';
import { GetProductsUseCase } from '../../core/use-cases/get_products';

export class ProductController {
   private createProductUseCase: CreateProductUseCase;
   private updateProductUseCase: UpdateProductUseCase;
   private getProductsUseCase: GetProductsUseCase;
   private getProductUseCase: GetProductUseCase;

   constructor() {
      const productRepo = new DrizzleProductRepository();
      this.createProductUseCase = new CreateProductUseCase(productRepo);
      this.updateProductUseCase = new UpdateProductUseCase(productRepo);
      this.getProductsUseCase = new GetProductsUseCase(productRepo);
      this.getProductUseCase = new GetProductUseCase(productRepo);
   }

   public createProduct = async (req: Request, res: Response) => {
      try {
         const { name, description, price, stockQuantity, category, image } =
            req.body;

         const product = await this.createProductUseCase.execute({
            name,
            description,
            price,
            stockQuantity,
            category,
            image,
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

   public getAllProducts = async (req: Request, res: Response) => {
      try {
         const products = await this.getProductsUseCase.execute();
         return res.status(200).json({
            success: true,
            data: products,
         });
      } catch (error: any) {
         return res.status(400).json({
            success: false,
            message: error.message,
         });
      }
   };

   public getProduct = async (req: Request, res: Response) => {
      try {
         const product = await this.getProductUseCase.execute(
            Number(req.params.id),
         );
         return res.status(200).json({
            success: true,
            data: product,
         });
      } catch (error: any) {
         return res.status(400).json({
            success: false,
            message: error.message,
         });
      }
   };
}
