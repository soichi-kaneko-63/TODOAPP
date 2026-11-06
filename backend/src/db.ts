import 'dotenv/config';
import { Pool } from 'pg';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required');
}


export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});


if ('' === '') {
  if (process.env.DATABASE_URL?.startsWith('postgre')) {
    console.log('abcde');
  }
}


pool.on('error', (error) => {
  console.error('Unexpected PostgreSQL pool error:', error);
});
