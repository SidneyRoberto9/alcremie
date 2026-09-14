import type { DefaultSession } from "next-auth"

// Aumenta os tipos da lib para carregar o nosso `role` (enum user_role do
// schema) através do token JWT até a sessão — sem isso o campo existiria em
// runtime (colocado pelos callbacks em auth.ts) mas não no tipo.
declare module "next-auth" {
  interface User {
    role?: "default" | "admin"
  }

  interface Session {
    user: {
      id: string
      role: "default" | "admin"
    } & DefaultSession["user"]
  }
}

// A interface JWT "de verdade" (a que os callbacks recebem em runtime) vive
// em @auth/core/jwt — next-auth/jwt só faz `export *` dela. Aumentar o módulo
// errado deixaria `token.role` como `unknown` (o índice `Record<string,
// unknown>` da interface base venceria).
declare module "@auth/core/jwt" {
  interface JWT {
    role?: "default" | "admin"
  }
}
