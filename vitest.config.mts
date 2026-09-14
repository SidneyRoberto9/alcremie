import path from "node:path"
import react from "@vitejs/plugin-react"
import { loadEnv } from "vite"
import { defineConfig } from "vitest/config"

// vitest não lê .env.local sozinho (só o Next.js faz isso). Sem isto, `npx
// vitest run` num shell limpo falha com ECONNREFUSED em vez de usar o
// DATABASE_URL do arquivo. Uma variável já exportada no shell (ou pela CI)
// vence — só preenche o que ainda não existe em process.env.
const fileEnv = loadEnv(process.env.NODE_ENV ?? "test", process.cwd(), "")
for (const [key, value] of Object.entries(fileEnv)) {
  process.env[key] ??= value
}

export default defineConfig({
  test: {
    passWithNoTests: true,
    projects: [
      {
        resolve: {
          alias: { "@": path.resolve(import.meta.dirname, "./src") },
        },
        test: {
          name: "node",
          environment: "node",
          include: ["src/db/**/*.test.ts", "src/services/**/*.test.ts"],
        },
      },
      {
        plugins: [react()],
        resolve: {
          alias: { "@": path.resolve(import.meta.dirname, "./src") },
        },
        test: {
          name: "jsdom",
          environment: "jsdom",
          include: ["src/components/**/*.test.{ts,tsx}", "src/app/**/*.test.{ts,tsx}"],
          setupFiles: ["./vitest.setup.ts"],
        },
      },
    ],
  },
})
