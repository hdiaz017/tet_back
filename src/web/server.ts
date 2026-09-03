import express, { Router, type Express } from 'express';
import path from 'path';

interface Options {
   port: number;
   routes: Router;
   public_path?: string;
}

export class Server {
   public readonly app: Express;
   private serverListener?: any;
   private readonly port: number;
   private readonly publicPath: string;
   private readonly routes: Router;

   constructor(options: Options) {
      const { port, routes, public_path = 'public' } = options;
      this.port = port;
      this.publicPath = public_path;
      this.routes = routes;
      this.app = express();
   }

   async start() {
      // Middlewares
      this.app.use(express.json());
      this.app.use(express.urlencoded({ extended: true }));

      // Routes
      this.app.use(this.routes);

      this.serverListener = this.app.listen(this.port, () => {
         console.log(`Server running on port ${this.port}`);
      });
   }

   public close() {
      this.serverListener?.close();
   }
}
