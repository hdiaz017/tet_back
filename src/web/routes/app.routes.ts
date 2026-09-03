import { Router } from 'express';
import { SaleController } from '../controllers/sale.controller';
import { ProductController } from '../controllers/product.controller';

export class AppRoutes {
  static get routes(): Router {
    const router = Router();
    const saleController = new SaleController();
    const productController = new ProductController();

    // Sale Routes
    router.post('/sales', saleController.createSale);

    // Product Routes
    router.post('/products', productController.createProduct);
    router.put('/products/:id', productController.updateProduct);

    return router;
  }
}