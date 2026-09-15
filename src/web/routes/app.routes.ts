import { Router } from 'express';
import { SaleController } from '../controllers/sale.controller';
import { ProductController } from '../controllers/product.controller';

export class AppRoutes {
   static get routes(): Router {
      const router = Router();
      const saleController = new SaleController();
      const productController = new ProductController();

      // Sale Routes
      router.get('/api/sales', saleController.getAllSales);
      router.get('/api/sales/:id', saleController.getSale);
      router.get('/api/sales/external/:externalSaleId', saleController.getSale);
      router.post('/api/sales', saleController.createSale);

      // Product Routes
      router.get('/api/products', productController.getAllProducts);
      router.get('/api/products/:id', productController.getProduct);
      router.post('/api/products', productController.createProduct);
      router.put('/api/products/:id', productController.updateProduct);

      return router;
   }
}
