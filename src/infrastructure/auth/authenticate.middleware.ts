import type { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../../core/errors/UnauthorizedError';
import type { VerifyTokenUseCase } from '../../core/use-cases/verify_token';

export function createAuthMiddleware(verifyTokenUseCase: VerifyTokenUseCase) {
   return async (req: Request, res: Response, next: NextFunction) => {
      try {
         const authHeader = req.headers.authorization;
         if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedError('No token provided');
         }

         const token = authHeader.substring(7);
         const user = await verifyTokenUseCase.execute(token);

         (req as any).user = user;
         next();
      } catch (err) {
         if (err instanceof UnauthorizedError) {
            return res.status(401).json({ error: err.message });
         }
         console.error('Auth error:', err);
         res.status(401).json({ error: 'Unauthorized' });
      }
   };
}
