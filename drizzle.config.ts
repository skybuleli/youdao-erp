import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './server/src/schema/index.ts',
  out: './drizzle/migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: './drizzle/local.db'
  }
})
