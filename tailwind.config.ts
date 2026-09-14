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
      colors: {
        lucide: {
          800: "#161618",
          600: "#1B1B1F",
          300: "#414853",
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@headlessui/tailwindcss"), require("tailwind-scrollbar")],
}
export default config
