import { and, eq } from "drizzle-orm"
import { db } from "@/db/client"
import { favorites } from "@/db/schema"

/** Toggle de favorito — agora idempotente por chave composta, não por leitura prévia. */
export const toggleFavorite = async (userId: string, imageId: string) => {
  const deleted = await db
    .delete(favorites)
    .where(and(eq(favorites.userId, userId), eq(favorites.imageId, imageId)))
    .returning({ imageId: favorites.imageId })

  if (deleted.length > 0) {
    return { isFavorite: false }
  }

  await db.insert(favorites).values({ userId, imageId }).onConflictDoNothing()
  return { isFavorite: true }
}
