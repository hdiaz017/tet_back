import type { User } from '../../core/entities/user';
import { UnauthorizedError } from '../../core/errors/UnauthorizedError';
import type { IAuthRepository } from '../../core/ports/IAuthRepository';
import { supabase } from './supabase.config';

export class SupabaseAuthRepository implements IAuthRepository {
   async verifyToken(token: string): Promise<User> {
      const {
         data: { user },
         error,
      } = await supabase.auth.getUser(token);

      if (error || !user) {
         throw new UnauthorizedError('Invalid token');
      }

      return {
         id: user.id,
         email: user.email!,
      };
   }
}
