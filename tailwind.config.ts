import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/app/**/*.{ts,tsx}",
    "./src/src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      // Preflight aplica isso a todo elemento, com ou sem borda visível. O
      // padrão do Tailwind é gray-200 — vaza um cinza que não é nenhum token
      // da paleta em qualquer elemento sem cor de borda explícita. currentColor
      // é o valor que o navegador reporta quando não há `border-color` nenhum.
      borderColor: {
        DEFAULT: "currentColor",
      },
      colors: {
        rail: "#161618",
        sidebar: "#1B1B1F",
        content: "#212128",
        raise: "#282830",
        line: "#2E2E37",
        "line-2": "#414853",
        accent: { DEFAULT: "#A78BFA", soft: "#C4B5FD", deep: "#8B5CF6" },
        ink: { DEFAULT: "#F4F4F5", 2: "#A1A1AA", 3: "#71717A" },
        ok: "#34D399",
        warn: "#F0A45E",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("tailwind-scrollbar")],
}
export default config
