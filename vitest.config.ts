import path from "node:path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    passWithNoTests: true,
    projects: [
      {
        resolve: {
          alias: { "@": path.resolve(__dirname, "./src") },
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
          alias: { "@": path.resolve(__dirname, "./src") },
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
