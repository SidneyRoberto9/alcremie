import { db } from "@/db/client"
import { counters } from "@/db/schema"

const DEFAULTS = { images: 0, tags: 0, requests: 0 }

/**
 * Home. Três leituras de índice em vez de três COUNT(*) de tabela cheia.
 * Banco novo não tem linha em counters ainda, então os contadores ausentes
 * caem para 0 em vez de virar undefined na home.
 */
export const getStatistics = async () => {
  const rows = await db.select({ key: counters.key, value: counters.value }).from(counters)
  const byKey = new Map(rows.map((r) => [r.key, r.value]))
  return {
    images: byKey.get("images") ?? DEFAULTS.images,
    tags: byKey.get("tags") ?? DEFAULTS.tags,
    requests: byKey.get("requests") ?? DEFAULTS.requests,
  }
}
