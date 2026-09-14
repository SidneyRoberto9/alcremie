import NextAuth from "next-auth"
import { authConfig } from "@/lib/auth.config"
import { upsertUserByEmail } from "@/services/users"

// Instância "cheia": roda em route handler / server action / server
// component, nunca no middleware (ver auth.config.ts). Sem
// @auth/drizzle-adapter de propósito — a tabela `users` já é o schema do
// domínio (role, sem emailVerified/image), e com strategy "jwt" não existe
// tabela de sessão para o adapter escrever. O upsert é feito à mão aqui.
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    signIn: async ({ user }) => {
      if (!user.email) {
        return false
      }

      const dbUser = await upsertUserByEmail({
        email: user.email,
        name: user.name ?? user.email,
        avatarUrl: user.image ?? null,
      })

      // Mutação de propósito: é como o jwt() abaixo "lê de volta" o id/role
      // reais do banco em vez dos que vieram do perfil do Google.
      user.id = dbUser.id
      user.role = dbUser.role

      return true
    },
    jwt: async ({ token, user }) => {
      if (user) {
        token.sub = user.id
        token.role = user.role
      }

      return token
    },
  },
})
