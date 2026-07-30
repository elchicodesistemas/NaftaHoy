import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

if (!process.env.DATABASE_URL) {
  throw new Error('Falta DATABASE_URL en backend/.env (copiá .env.example y completá los datos de tu Postgres)');
}

export default defineConfig({
  schema: './src/models/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  // tracking en public.__drizzle_migrations en vez de crear un schema nuevo:
  // naftahoy_dev solo tiene CREATE sobre el schema public, no sobre la base.
  migrations: {
    schema: 'public',
  },
  verbose: true,
  strict: true,
});
