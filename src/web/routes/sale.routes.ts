import { Router } from 'express';
import { SaleController } from '../controllers/sale.controller';

export class SaleRoutes {
  static get routes(): Router {
    const router = Router();
    const controller = new SaleController();

    // Definir las rutas
    router.post('/', controller.createSale);

    return router;
  }
}