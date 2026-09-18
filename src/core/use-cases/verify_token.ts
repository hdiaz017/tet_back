import type { User } from '../entities/user';
import { UnauthorizedError } from '../errors/UnauthorizedError';
import type { IAuthRepository } from '../ports/IAuthRepository';

export class VerifyTokenUseCase {
   constructor(private authRepository: IAuthRepository) {}

   async execute(token: string): Promise<User> {
      if (!token) {
         throw new UnauthorizedError('No token provided');
      }

      const user = await this.authRepository.verifyToken(token);
      return user;
   }
}
