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
          // next-auth/@auth/core são ESM puro sem "exports" no package.json
          // do Next 16.3.5 instalado aqui; externalizados (padrão do Vitest
          // para node_modules), o resolver nativo do Node não acha
          // "next/server" sem a extensão .js e quebra o import. server.deps
          // .inline força o Vite a transformar esses pacotes, que resolve do
          // jeito de bundler em vez do ESM estrito do Node.
          server: {
            deps: {
              inline: ["next-auth", "@auth/core"],
            },
          },
          environment: "node",
          include: [
            "src/db/**/*.test.ts",
            "src/services/**/*.test.ts",
            "src/app/api/**/*.test.ts",
            "src/middleware.test.ts",
          ],
          // Os arquivos aqui batem no mesmo Postgres de verdade, sem
          // transação por teste — em paralelo, fixtures de um arquivo (ex.:
          // linhas rating=general de schema.test.ts) vazam para contagens
          // sem filtro de outro (ex.: a paginação completa em images.test.ts),
          // dando falso negativo intermitente. Sequencial custa <1s aqui.
          fileParallelism: false,
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
          include: [
            "src/components/**/*.test.{ts,tsx}",
            "src/app/**/*.test.{ts,tsx}",
            "src/utils/**/*.test.{ts,tsx}",
          ],
          exclude: ["src/app/api/**"],
          setupFiles: ["./vitest.setup.ts"],
        },
      },
    ],
  },
})
