import { desc, sql } from "drizzle-orm"
import { db } from "@/db/client"
import { tags } from "@/db/schema"

/**
 * Autocomplete de tag. `%` é o operador de similaridade do pg_trgm e usa o
 * índice GIN; o LIKE '%termo%' de hoje não usa índice nenhum.
 */
export const searchTags = async (term: string, limit = 25) => {
  if (term.trim().length < 2) {
    return db
      .select({ id: tags.id, name: tags.name, slug: tags.slug, imageCount: tags.imageCount })
      .from(tags)
      .orderBy(desc(tags.imageCount))
      .limit(limit)
  }

  return db
    .select({ id: tags.id, name: tags.name, slug: tags.slug, imageCount: tags.imageCount })
    .from(tags)
    .where(sql`${tags.name} % ${term}`)
    .orderBy(sql`similarity(${tags.name}, ${term}) DESC`, desc(tags.imageCount))
    .limit(limit)
}
