import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
   throw new Error('DATABASE_URL is not defined in environment variables');
}

export const db = drizzle(connectionString);
