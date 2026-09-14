import { inArray } from "drizzle-orm"
import { afterAll, beforeAll, expect, test } from "vitest"
import { db } from "@/db/client"
import { images, imageTags, tags } from "@/db/schema"
import { decodeCursor, encodeCursor, fetchImageFeed, fetchImagesByTag } from "@/services/images"
import type { FeedImage } from "@/types/image"

// cloudinaryId/slug NÃO começam com "test/" nem "test-": o afterAll de
// src/db/schema.test.ts varre exatamente esses prefixos, e os dois arquivos
// rodam em paralelo contra o mesmo banco — um prefixo igual seria varrido no
// meio deste beforeAll por uma limpeza de outro arquivo.
const HASHES = Array.from({ length: 5 }, (_, i) => `f${i}`.padEnd(64, "0"))
// Três linhas com createdAt idêntico: a única forma de exercitar o segundo
// braço do or(...) (o desempate por id). Datas distintas nunca entram nele.
const TIED_HASHES = Array.from({ length: 3 }, (_, i) => `t${i}`.padEnd(64, "0"))
const TIED_AT = new Date(Date.UTC(2020, 1, 1))

let tiedIds: string[] = []
let tagId = ""

beforeAll(async () => {
  await db.insert(images).values(
    HASHES.map((contentHash, i) => ({
      contentHash,
      cloudinaryId: `svc-test/cursor-${i}`,
      cloudinaryVersion: 1,
      width: 100,
      height: 100,
      bytes: 1,
      rating: "general" as const,
      createdAt: new Date(Date.UTC(2020, 0, 1 + i)),
    }))
  )

  const tiedRows = await db
    .insert(images)
    .values(
      TIED_HASHES.map((contentHash, i) => ({
        contentHash,
        cloudinaryId: `svc-test/cursor-tied-${i}`,
        cloudinaryVersion: 1,
        width: 100,
        height: 100,
        bytes: 1,
        rating: "general" as const,
        createdAt: TIED_AT,
      }))
    )
    .returning({ id: images.id, contentHash: images.contentHash })

  const byHash = new Map(tiedRows.map((r) => [r.contentHash, r.id]))
  tiedIds = TIED_HASHES.map((h) => byHash.get(h) as string)

  const [tag] = await db
    .insert(tags)
    .values({ name: "svc-test-tie-tag", slug: "svc-test-tie-tag" })
    .returning({ id: tags.id })
  tagId = tag.id

  // Liga a tag às 3 linhas empatadas e às duas mais recentes das distintas
  // (day5, day4), para que a paginação por tag também cruze o empate.
  const day5Hash = HASHES[4]
  const day4Hash = HASHES[3]
  const untiedRows = await db
    .select({ id: images.id, contentHash: images.contentHash })
    .from(images)
    .where(inArray(images.contentHash, [day5Hash, day4Hash]))
  const untiedIds = untiedRows.map((r) => r.id)

  await db.insert(imageTags).values([...tiedIds, ...untiedIds].map((imageId) => ({ imageId, tagId })))
})

afterAll(async () => {
  await db.delete(images).where(inArray(images.contentHash, [...HASHES, ...TIED_HASHES]))
  await db.delete(tags).where(inArray(tags.id, [tagId]))
})

const isNonIncreasing = (rows: Pick<FeedImage, "createdAt" | "id">[]) =>
  rows.every((row, i) => {
    if (i === 0) {
      return true
    }
    const prev = rows[i - 1]
    if (prev.createdAt.getTime() !== row.createdAt.getTime()) {
      return prev.createdAt.getTime() > row.createdAt.getTime()
    }
    return prev.id > row.id
  })

test("o cursor não repete nem pula linhas", async () => {
  const first = await fetchImageFeed({ nsfw: false, limit: 2 })
  expect(first.data).toHaveLength(2)
  expect(first.hasNext).toBe(true)

  const second = await fetchImageFeed({ nsfw: false, limit: 2, cursor: first.cursor ?? undefined })

  const combined = [...first.data, ...second.data]
  const ids = combined.map((row) => row.id)
  expect(new Set(ids).size).toBe(ids.length)
  expect(isNonIncreasing(combined)).toBe(true)
})

test("o desempate por id resolve linhas com o mesmo createdAt", async () => {
  const expectedTiedOrder = [...tiedIds].sort((a, b) => (a > b ? -1 : a < b ? 1 : 0))

  const pages: FeedImage[] = []
  let cursor: string | undefined
  for (let i = 0; i < 10; i++) {
    const page = await fetchImageFeed({ nsfw: false, limit: 2, cursor })
    pages.push(...page.data)
    if (!page.hasNext) {
      break
    }
    cursor = page.cursor ?? undefined
  }

  expect(pages).toHaveLength(HASHES.length + TIED_HASHES.length)

  const ids = pages.map((row) => row.id)
  expect(new Set(ids).size).toBe(ids.length)
  expect(isNonIncreasing(pages)).toBe(true)

  // As 3 linhas empatadas ficam juntas no topo (createdAt mais recente) e,
  // entre si, saem em ordem decrescente de id — a prova direta do desempate.
  expect(ids.slice(0, TIED_HASHES.length)).toEqual(expectedTiedOrder)
})

test("fetchImagesByTag também resolve o desempate por id ao paginar", async () => {
  const pages: FeedImage[] = []
  let cursor: string | undefined
  for (let i = 0; i < 10; i++) {
    const page = await fetchImagesByTag({ tagId, nsfw: false, limit: 2, cursor })
    pages.push(...page.data)
    if (!page.hasNext) {
      break
    }
    cursor = page.cursor ?? undefined
  }

  // 3 empatadas + day5 + day4
  expect(pages).toHaveLength(5)

  const ids = pages.map((row) => row.id)
  expect(new Set(ids).size).toBe(ids.length)
  expect(isNonIncreasing(pages)).toBe(true)
})

test("cursor malformado cai na primeira página em vez de estourar", () => {
  expect(decodeCursor("lixo")).toBeUndefined()
  expect(decodeCursor(undefined)).toBeUndefined()

  const round = { createdAt: new Date("2020-01-01T00:00:00.000Z"), id: "abc" }
  expect(decodeCursor(encodeCursor(round))).toEqual(round)
})
