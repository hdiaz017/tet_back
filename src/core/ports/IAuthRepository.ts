import type { User } from '../entities/user';

export interface IAuthRepository {
   verifyToken(token: string): Promise<User>;
}
