import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "@/db/schema"

// Vercel serverless abre uma conexão por invocação; self-hosted é processo longo.
const max = process.env.VERCEL ? 1 : 10

const client = postgres(process.env.DATABASE_URL as string, { max })

export const db = drizzle(client, { schema })
