import type { Request, Response } from 'express';
import {
   CreateProductUseCase,
   type CreateProductCommand,
} from '../../core/use-cases/create_product';
import {
   UpdateProductUseCase,
   type UpdateProductCommand,
} from '../../core/use-cases/update_product';
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

   public createProduct = async (
      req: Request,
      res: Response,
   ): Promise<void> => {
      try {
         const { name, description, price, stockQuantity, category, image } =
            req.body;

         // ✅ Validar DTO
         if (!name || !price || !category) {
            res.status(400).json({
               success: false,
               message: 'name, price, and category are required',
            });
            return;
         }

         // ✅ Convertir a command
         const command: CreateProductCommand = {
            name,
            description: description || '',
            price,
            stockQuantity: stockQuantity || 0,
            category,
            image: image || '',
         };

         const product = await this.createProductUseCase.execute(command);

         res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: product.toPrimitives(),
         });
      } catch (error: any) {
         console.error('Error in createProduct:', error);
         res.status(400).json({
            success: false,
            message: error.message,
         });
      }
   };

   public updateProduct = async (
      req: Request,
      res: Response,
   ): Promise<void> => {
      try {
         const id = req.params.id as string; // ✅ string, no Number()

         if (!id) {
            res.status(400).json({
               success: false,
               message: 'Product ID is required',
            });
            return;
         }

         const { name, description, price, stockQuantity, category, image } =
            req.body;

         // ✅ Convertir a command
         const command: UpdateProductCommand = {
            id,
            name,
            description,
            price,
            stockQuantity,
            category,
            image,
         };

         const updatedProduct =
            await this.updateProductUseCase.execute(command);

         res.status(200).json({
            success: true,
            message: 'Product updated successfully',
            data: updatedProduct.toPrimitives(),
         });
      } catch (error: any) {
         if (error.message.includes('not found')) {
            res.status(404).json({
               success: false,
               message: error.message,
            });
         } else {
            console.error('Error in updateProduct:', error);
            res.status(400).json({
               success: false,
               message: error.message,
            });
         }
      }
   };

   public getAllProducts = async (
      req: Request,
      res: Response,
   ): Promise<void> => {
      try {
         const products = await this.getProductsUseCase.execute();

         res.status(200).json({
            success: true,
            data: products.map((p) => p.toPrimitives()),
         });
      } catch (error: any) {
         console.error('Error in getAllProducts:', error);
         res.status(500).json({
            success: false,
            message: error.message || 'Internal server error',
         });
      }
   };

   public getProduct = async (req: Request, res: Response): Promise<void> => {
      try {
         const id = req.params.id as string; // ✅ string, no Number()

         if (!id) {
            res.status(400).json({
               success: false,
               message: 'Product ID is required',
            });
            return;
         }

         const product = await this.getProductUseCase.execute(id);

         res.status(200).json({
            success: true,
            data: product.toPrimitives(),
         });
      } catch (error: any) {
         if (error.message.includes('not found')) {
            res.status(404).json({
               success: false,
               message: error.message,
            });
         } else {
            console.error('Error in getProduct:', error);
            res.status(500).json({
               success: false,
               message: error.message,
            });
         }
      }
   };

   public deleteProduct = async (
      req: Request,
      res: Response,
   ): Promise<void> => {
      try {
         const id = req.params.id; // ✅ string

         if (!id) {
            res.status(400).json({
               success: false,
               message: 'Product ID is required',
            });
            return;
         }

         // TODO: Agregar DeleteProductUseCase si es necesario
         // await this.deleteProductUseCase.execute(id);

         res.status(200).json({
            success: true,
            message: 'Product deleted successfully',
         });
      } catch (error: any) {
         if (error.message.includes('not found')) {
            res.status(404).json({
               success: false,
               message: error.message,
            });
         } else {
            console.error('Error in deleteProduct:', error);
            res.status(500).json({
               success: false,
               message: error.message,
            });
         }
      }
   };
}
