import express, { Router, type Express } from 'express';
import path from 'path';
import cors from 'cors';
import { SupabaseAuthRepository } from '../infrastructure/auth/supabase_auth.repository';
import { VerifyTokenUseCase } from '../core/use-cases/verify_token';
import { createAuthMiddleware } from '../infrastructure/auth/authenticate.middleware';
import { AppRoutes } from './routes/app.routes';

interface Options {
   port: number;

   public_path?: string;
}

export class Server {
   public readonly app: Express;
   private serverListener?: any;
   private readonly port: number;
   private readonly publicPath: string;

   constructor(options: Options) {
      const { port, public_path = 'public' } = options;
      this.port = port;
      this.publicPath = public_path;

      this.app = express();
   }

   async start() {
      // Cors
      this.app.use(
         cors({
            origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
            credentials: true,
         }),
      );
      // Middlewares
      this.app.use(express.json());
      this.app.use(express.urlencoded({ extended: true }));

      // DI
      const authRepository = new SupabaseAuthRepository();
      const verifyTokenUseCase = new VerifyTokenUseCase(authRepository);
      const authenticate = createAuthMiddleware(verifyTokenUseCase);

      // Routes
      this.app.use(AppRoutes.create(authenticate));

      this.serverListener = this.app.listen(this.port, () => {
         console.log(`Server running on port ${this.port}`);
      });
   }

   public close() {
      this.serverListener?.close();
   }
}
