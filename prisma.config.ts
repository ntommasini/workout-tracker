import { config } from 'dotenv';
import { defineConfig } from 'prisma/config';

// Prisma CLI doesn't auto-load .env.local, so we do it manually here
config({ path: '.env.local' });
config({ path: '.env' });

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});
