import type { NextAuthConfig } from "next-auth"
import Google from "next-auth/providers/google"

// Config edge-safe: nenhum import daqui toca `@/db` ou `@/services`. É o que
// permite o middleware (roda no edge runtime por padrão) chamar `auth()` sem
// puxar o driver `postgres` — Node-only — para o bundle. `src/lib/auth.ts`
// estende este objeto com os callbacks que leem/gravam no banco; o role já
// vem embutido no JWT (gravado lá) quando este config só decodifica o token.
export const authConfig = {
  providers: [Google],
  session: { strategy: "jwt" },
  trustHost: true,
  callbacks: {
    session: ({ session, token }) => ({
      ...session,
      user: { ...session.user, id: token.sub as string, role: token.role as "default" | "admin" },
    }),
  },
} satisfies NextAuthConfig
