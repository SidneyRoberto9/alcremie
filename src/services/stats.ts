import { count, sql } from "drizzle-orm"
import { db } from "@/db/client"
import { counters, images, tags } from "@/db/schema"

/**
 * Home. images e tags saem de COUNT(*) direto: a tabela counters só era escrita
 * pelo seed, então a home mostrava 0 para sempre num banco alimentado por
 * upload. Contar na hora custa dois index-only scans numa página revalidada a
 * cada 60s — mais barato que manter dois contadores denormalizados em sincronia.
 *
 * requests continua em counters porque não há tabela para contar: é o
 * countRequest abaixo que o incrementa, uma vez por chamada da API pública.
 */
export const getStatistics = async () => {
  const [[imageCount], [tagCount], requestRows] = await Promise.all([
    db.select({ value: count() }).from(images),
    db.select({ value: count() }).from(tags),
    db
      .select({ value: counters.value })
      .from(counters)
      .where(sql`${counters.key} = 'requests'`),
  ])

  return {
    images: imageCount?.value ?? 0,
    tags: tagCount?.value ?? 0,
    requests: requestRows[0]?.value ?? 0,
  }
}

/**
 * Um UPDATE por chamada da API. Sem transação e sem leitura antes: o
 * incremento acontece no banco, então chamadas concorrentes não se sobrescrevem.
 */
export const countRequest = async () => {
  await db
    .insert(counters)
    .values({ key: "requests", value: 1 })
    .onConflictDoUpdate({
      target: counters.key,
      set: { value: sql`${counters.value} + 1`, updatedAt: sql`now()` },
    })
}
