import { eq, sql } from "drizzle-orm"
import { db } from "@/db/client"
import { users } from "@/db/schema"

interface UpsertUserInput {
  email: string
  name: string
  avatarUrl: string | null
}

/**
 * Casa por `lower(email)`, que é a expressão do índice único da tabela — dois
 * logins do Google com capitalização diferente no e-mail têm que resolver
 * para a mesma linha.
 */
export const upsertUserByEmail = async ({ email, name, avatarUrl }: UpsertUserInput) => {
  const normalizedEmail = email.toLowerCase()
  const matchesEmail = sql`lower(${users.email}) = ${normalizedEmail}`

  const [existing] = await db.select().from(users).where(matchesEmail).limit(1)

  if (existing) {
    const [updated] = await db
      .update(users)
      .set({ name, avatarUrl, updatedAt: new Date() })
      .where(eq(users.id, existing.id))
      .returning()

    return updated
  }

  // ponytail: sem retry na corrida de dois signIns simultâneos do mesmo
  // e-mail novo (ambos passam pelo select acima sem `existing`, um dos dois
  // insert falha na unique constraint). Cenário raro (duplo clique no login
  // de um usuário que nunca logou); se aparecer em produção, envolver o
  // insert num try/catch por código 23505 e re-selecionar.
  const [created] = await db.insert(users).values({ email: normalizedEmail, name, avatarUrl }).returning()

  return created
}
