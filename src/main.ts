import { envs } from './config/envs';
import { SaleRoutes } from './web/routes/sale.routes';
import { Server } from './web/server';

(async () => {
   main();
})();

async function main() {
   try {
      // Database connection logic would go here
      console.log('Initializing application...');

      const server = new Server({
         port: envs.PORT,
         routes: AppRoutes.routes,
      });

      await server.start();
   } catch (error) {
      console.error('Application failed to start:', error);
      process.exit(1);
   }
}
