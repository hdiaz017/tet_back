import 'dotenv/config';
import { AppRoutes } from './web/routes/app.routes';
import { Server } from './web/server';

(async () => {
   main();
})();

async function main() {
   try {
      // Database connection logic would go here
      console.log('Initializing application...');

      const server = new Server({
         port: Number(process.env.PORT),
      });

      await server.start();
   } catch (error) {
      console.error('Application failed to start:', error);
      process.exit(1);
   }
}
