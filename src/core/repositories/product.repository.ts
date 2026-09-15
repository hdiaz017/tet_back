import { Product } from '../entities/product';

export interface ProductRepository {
   findById(id: string): Promise<Product | null>;
   findAll(): Promise<Product[]>;
   create(product: Product): Promise<Product>;
   update(product: Product): Promise<Product>;
   delete(id: string): Promise<void>;
}
