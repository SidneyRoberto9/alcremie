import { and, count, desc, eq, inArray, lt, ne, or, sql } from "drizzle-orm"
import { db } from "@/db/client"
import { images, imageTags, tags } from "@/db/schema"
import type { Cursor, FeedPage, ImageDetail, SimilarImage, TaggedFeedPage } from "@/types/image"

// Teto de tags por card do /recent — a prancha mostra 4 a 5, nunca mais.
const CARD_TAG_LIMIT = 5

// A página de mais vista mostra a nuvem inteira, não o resumo do card.
const DETAIL_TAG_LIMIT = 100

// Abaixo disso o índice de Jaccard não é confiável o bastante pra "quase
// idêntica" — pedido explícito: só aparece com no mínimo 98 de 100 pontos.
const SIMILARITY_THRESHOLD = 98
const SIMILAR_LIMIT = 6

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

// Extraído de fetchImageFeedWithTags para a página de mais vista reusar o
// mesmo join batelado por IN(...) em vez de repetir a query.
const loadTagNamesByImage = async (imageIds: string[], limitPerImage: number) => {
  if (imageIds.length === 0) {
    return new Map<string, string[]>()
  }

  const tagRows = await db
    .select({ imageId: imageTags.imageId, name: tags.name })
    .from(imageTags)
    .innerJoin(tags, eq(tags.id, imageTags.tagId))
    .where(inArray(imageTags.imageId, imageIds))
    .orderBy(desc(imageTags.score))

  const tagsByImage = new Map<string, string[]>()
  for (const row of tagRows) {
    const list = tagsByImage.get(row.imageId) ?? []
    if (list.length < limitPerImage) {
      list.push(row.name)
    }
    tagsByImage.set(row.imageId, list)
  }

  return tagsByImage
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

  const tagsByImage = await loadTagNamesByImage(
    page.data.map((row) => row.id),
    CARD_TAG_LIMIT
  )

  return { ...page, data: page.data.map((row) => ({ ...row, tags: tagsByImage.get(row.id) ?? [] })) }
}

/**
 * Página de detalhe (/images/[id]). Sem filtro de nsfw — quem chegou aqui já
 * escolheu a imagem pelo id, diferente das listagens, que decidem por rating.
 */
export const fetchImageById = async (id: string): Promise<ImageDetail | null> => {
  const [row] = await db
    .select({ ...FEED_COLUMNS, views: images.views, bytes: images.bytes, format: images.format, isNsfw: images.isNsfw })
    .from(images)
    .where(eq(images.id, id))
    .limit(1)

  if (!row) {
    return null
  }

  const tagsByImage = await loadTagNamesByImage([row.id], DETAIL_TAG_LIMIT)
  return { ...row, tags: tagsByImage.get(row.id) ?? [] }
}

/** Um UPDATE por abertura da página de detalhe — mesmo padrão do countRequest. */
export const incrementViews = async (imageId: string) => {
  await db
    .update(images)
    .set({ views: sql`${images.views} + 1` })
    .where(eq(images.id, imageId))
}

/**
 * Similaridade por índice de Jaccard sobre o CONJUNTO de tags (não a
 * probabilidade do modelo): |interseção| / |união| × 100. Pedido explícito é
 * um corte em 98, e nesse ponto só imagens com quase todas as tags iguais
 * passam — comparar por presença/ausência já basta, pesar por score só
 * complicaria a conta sem mudar quem passa do corte.
 *
 * Duas queries batidas por IN(...) (candidatos que compartilham alguma tag,
 * depois o total de tags de cada candidato), pontuação em JS — mesmo estilo
 * de fetchImageFeedWithTags, nunca uma query por candidato.
 */
export const fetchSimilarImages = async (imageId: string, nsfw: boolean): Promise<SimilarImage[]> => {
  const targetTags = await db.select({ tagId: imageTags.tagId }).from(imageTags).where(eq(imageTags.imageId, imageId))

  if (targetTags.length === 0) {
    return []
  }

  const tagIds = targetTags.map((t) => t.tagId)
  const targetCount = tagIds.length

  const shared = await db
    .select({ imageId: imageTags.imageId, shared: count() })
    .from(imageTags)
    .where(and(inArray(imageTags.tagId, tagIds), ne(imageTags.imageId, imageId)))
    .groupBy(imageTags.imageId)

  if (shared.length === 0) {
    return []
  }

  const totals = await db
    .select({ imageId: imageTags.imageId, total: count() })
    .from(imageTags)
    .where(
      inArray(
        imageTags.imageId,
        shared.map((row) => row.imageId)
      )
    )
    .groupBy(imageTags.imageId)
  const totalByImage = new Map(totals.map((row) => [row.imageId, row.total]))

  const scored = shared
    .map((row) => {
      const union = targetCount + (totalByImage.get(row.imageId) ?? row.shared) - row.shared
      return { imageId: row.imageId, score: union > 0 ? Math.round((row.shared / union) * 100) : 0 }
    })
    .filter((row) => row.score >= SIMILARITY_THRESHOLD)
    .sort((a, b) => b.score - a.score)
    .slice(0, SIMILAR_LIMIT)

  if (scored.length === 0) {
    return []
  }

  const scoreByImage = new Map(scored.map((row) => [row.imageId, row.score]))
  const rows = await db
    .select(FEED_COLUMNS)
    .from(images)
    .where(
      and(
        inArray(
          images.id,
          scored.map((row) => row.imageId)
        ),
        eq(images.isNsfw, nsfw)
      )
    )

  return rows.map((row) => ({ ...row, score: scoreByImage.get(row.id) ?? 0 })).sort((a, b) => b.score - a.score)
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
