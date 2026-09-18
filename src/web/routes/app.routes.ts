import { Router, type RequestHandler } from 'express';
import { SaleController } from '../controllers/sale.controller';
import { ProductController } from '../controllers/product.controller';

export class AppRoutes {
   static create(authenticate: RequestHandler): Router {
      const router = Router();
      const saleController = new SaleController();
      const productController = new ProductController();

      // Sale Routes
      router.get('/api/sales', authenticate, saleController.getAllSales);
      router.get('/api/sales/:id', authenticate, saleController.getSale);
      router.get(
         '/api/sales/external/:externalSaleId',
         saleController.getSaleByExternalId,
      );
      router.post('/api/sales', saleController.createSale);

      // Product Routes
      router.get('/api/products', productController.getAllProducts);
      router.get('/api/products/:id', productController.getProduct);
      router.post(
         '/api/products',
         authenticate,
         productController.createProduct,
      );
      router.put(
         '/api/products/:id',
         authenticate,
         productController.updateProduct,
      );

      return router;
   }
}
