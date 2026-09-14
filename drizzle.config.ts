import { defineConfig } from "drizzle-kit"

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: { url: process.env.DATABASE_URL! },
  // A extensão pg_trgm é criada por migração própria (0000_extensions.sql);
  // esta linha impede o drizzle-kit de tentar remover o índice GIN por não
  // reconhecer o operador gin_trgm_ops.
  extensionsFilters: ["postgis"],
  verbose: true,
  strict: true,
})
