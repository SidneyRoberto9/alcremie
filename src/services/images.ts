import { and, count, desc, eq, inArray, lt, or, sql } from "drizzle-orm"
import { db } from "@/db/client"
import { images, imageTags, tags } from "@/db/schema"
import type { Cursor, FeedImageWithTags, FeedPage, TaggedFeedPage } from "@/types/image"

// Teto de tags por card do /recent — a prancha mostra 4 a 5, nunca mais.
const CARD_TAG_LIMIT = 5

const FEED_COLUMNS = {
  id: images.id,
  cloudinaryId: images.cloudinaryId,
  cloudinaryVersion: images.cloudinaryVersion,
  width: images.width,
  height: images.height,
  placeholder: images.placeholder,
  rating: images.rating,
  createdAt: images.createdAt,
}

// Desempate do cursor: usado tanto pelo feed quanto pela galeria por tag, uma
// só vez, para as duas rotas nunca poderem divergir no critério de corte.
const cursorCondition = (cursor: Cursor | undefined) =>
  cursor
    ? or(lt(images.createdAt, cursor.createdAt), and(eq(images.createdAt, cursor.createdAt), lt(images.id, cursor.id)))
    : undefined

/**
 * Feed do /recent. Cursor em vez de OFFSET: o custo é o mesmo na página 1 e
 * na página 400, porque o índice images_feed_idx é percorrido a partir da
 * posição, não desde o começo.
 */
export const fetchImageFeed = async (opts: { nsfw: boolean; limit?: number; cursor?: string }): Promise<FeedPage> => {
  const limit = opts.limit ?? 35
  const cursor = decodeCursor(opts.cursor)

  const rows = await db
    .select(FEED_COLUMNS)
    .from(images)
    .where(and(eq(images.isNsfw, opts.nsfw), cursorCondition(cursor)))
    .orderBy(desc(images.createdAt), desc(images.id))
    .limit(limit + 1)

  const hasNext = rows.length > limit
  const data = hasNext ? rows.slice(0, limit) : rows
  const last = data.at(-1)

  return {
    data,
    hasNext,
    cursor: last ? encodeCursor({ createdAt: last.createdAt, id: last.id }) : null,
  }
}

/**
 * Mesma página do feed, com as tags de cada imagem penduradas (ordenadas por
 * score, capadas em CARD_TAG_LIMIT) — é o que o card do /recent precisa para
 * mostrar "o que o modelo achou", que FEED_COLUMNS sozinho não carrega. Uma
 * segunda query batelada por IN(...), não uma por imagem: uma função à parte
 * em vez de um parâmetro em fetchImageFeed para a galeria (que só pagina por
 * número, nunca por cursor) nunca correr esse join à toa.
 */
export const fetchImageFeedWithTags = async (opts: {
  nsfw: boolean
  limit?: number
  cursor?: string
}): Promise<TaggedFeedPage> => {
  const page = await fetchImageFeed(opts)

  if (page.data.length === 0) {
    return { ...page, data: [] }
  }

  const tagRows = await db
    .select({ imageId: imageTags.imageId, name: tags.name })
    .from(imageTags)
    .innerJoin(tags, eq(tags.id, imageTags.tagId))
    .where(
      inArray(
        imageTags.imageId,
        page.data.map((row) => row.id)
      )
    )
    .orderBy(desc(imageTags.score))

  const tagsByImage = new Map<string, string[]>()
  for (const row of tagRows) {
    const list = tagsByImage.get(row.imageId) ?? []
    if (list.length < CARD_TAG_LIMIT) {
      list.push(row.name)
    }
    tagsByImage.set(row.imageId, list)
  }

  const data: FeedImageWithTags[] = page.data.map((row) => ({ ...row, tags: tagsByImage.get(row.id) ?? [] }))

  return { ...page, data }
}

/**
 * Galeria paginada por número. Continua usando OFFSET porque a UI tem botões
 * de página e "Last" — com images_feed_idx no lugar, o plano é um index scan,
 * não a varredura de hoje. O COUNT só é recalculado quando `total` não vem.
 */
export const fetchImagePage = async (opts: { nsfw: boolean; page: number; limit?: number; total?: number }) => {
  const limit = opts.limit ?? 35
  const page = Math.max(1, Math.trunc(opts.page))

  const [rows, total] = await Promise.all([
    db
      .select(FEED_COLUMNS)
      .from(images)
      .where(eq(images.isNsfw, opts.nsfw))
      .orderBy(desc(images.createdAt), desc(images.id))
      .limit(limit)
      .offset((page - 1) * limit),
    opts.total !== undefined
      ? Promise.resolve(opts.total)
      : db
          .select({ n: count() })
          .from(images)
          .where(eq(images.isNsfw, opts.nsfw))
          .then((r) => r[0].n),
  ])

  return { data: rows, page, total, totalPage: Math.max(1, Math.ceil(total / limit)) }
}

/** Galeria filtrada por tag. A junção entra pelo índice image_tags_by_tag_idx. */
export const fetchImagesByTag = async (opts: {
  tagId: string
  nsfw: boolean
  limit?: number
  cursor?: string
}): Promise<FeedPage> => {
  const limit = opts.limit ?? 35
  const cursor = decodeCursor(opts.cursor)

  const rows = await db
    .select(FEED_COLUMNS)
    .from(imageTags)
    .innerJoin(images, eq(images.id, imageTags.imageId))
    .where(and(eq(imageTags.tagId, opts.tagId), eq(images.isNsfw, opts.nsfw), cursorCondition(cursor)))
    .orderBy(desc(images.createdAt), desc(images.id))
    .limit(limit + 1)

  const hasNext = rows.length > limit
  const data = hasNext ? rows.slice(0, limit) : rows
  const last = data.at(-1)

  return { data, hasNext, cursor: last ? encodeCursor({ createdAt: last.createdAt, id: last.id }) : null }
}

/**
 * ponytail: ORDER BY random() varre a tabela. Abaixo de ~100 mil linhas custa
 * menos de um milissegundo e é uma query só, contra o SELECT de todos os ids
 * que a versão atual traz para o Node. Se o acervo crescer muito, trocar por
 * TABLESAMPLE SYSTEM_ROWS(1) ou por um id sorteado dentro de MIN/MAX.
 */
export const randomImage = async (nsfw = false) => {
  const random = sql`random()`
  const rows = await db.select(FEED_COLUMNS).from(images).where(eq(images.isNsfw, nsfw)).orderBy(random).limit(1)

  return rows[0] ?? null
}

/**
 * Grava a imagem e todas as tags do modelo numa transação, sem laço por tag:
 * um INSERT para as tags novas, um para a junção. Substitui as ~60 queries
 * sequenciais que o upload faz hoje por arquivo.
 */
export const createImageWithTags = async (
  image: typeof images.$inferInsert,
  detected: { name: string; score: number; category?: "general" | "character" }[]
) =>
  db.transaction(async (tx) => {
    const [row] = await tx
      .insert(images)
      .values(image)
      .onConflictDoNothing({ target: images.contentHash })
      .returning({ id: images.id })

    if (!row) {
      return null
    }

    if (detected.length > 0) {
      const tagRows = await tx
        .insert(tags)
        .values(
          detected.map((t) => ({
            name: t.name,
            slug: t.name.replaceAll("_", "-"),
            category: t.category ?? ("general" as const),
          }))
        )
        .onConflictDoUpdate({
          target: tags.name,
          set: { imageCount: sql`${tags.imageCount} + 1` },
        })
        .returning({ id: tags.id, name: tags.name })

      const scoreOf = new Map(detected.map((t) => [t.name, t.score]))

      await tx.insert(imageTags).values(
        tagRows.map((t) => ({
          imageId: row.id,
          tagId: t.id,
          score: scoreOf.get(t.name) ?? null,
        }))
      )
    }

    return row.id
  })

// Cursor codificado no service, não no handler: rotas e componentes só veem
// uma string opaca, nunca o par (createdAt, id) usado no desempate do ORDER BY.
export const encodeCursor = (cursor: Cursor) =>
  Buffer.from(JSON.stringify({ c: cursor.createdAt.toISOString(), i: cursor.id })).toString("base64url")

export const decodeCursor = (raw: string | undefined): Cursor | undefined => {
  if (!raw) {
    return undefined
  }

  try {
    const parsed = JSON.parse(Buffer.from(raw, "base64url").toString())
    return { createdAt: new Date(parsed.c), id: parsed.i }
  } catch {
    return undefined
  }
}
