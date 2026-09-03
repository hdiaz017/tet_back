import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';

export class ProductRoutes {
   static get routes(): Router {
      const router = Router();
      const controller = new ProductController();

      // Definir las rutas
      router.post('/', controller.createProduct);
      router.put('/:id', controller.updateProduct);

      return router;
   }
}
