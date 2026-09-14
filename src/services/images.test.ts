import { inArray } from "drizzle-orm"
import { afterAll, beforeAll, expect, test } from "vitest"
import { db } from "@/db/client"
import { images } from "@/db/schema"
import { decodeCursor, encodeCursor, fetchImageFeed } from "@/services/images"

const HASHES = Array.from({ length: 5 }, (_, i) => `f${i}`.padEnd(64, "0"))

beforeAll(async () => {
  await db.insert(images).values(
    HASHES.map((contentHash, i) => ({
      contentHash,
      cloudinaryId: `test/cursor-${i}`,
      cloudinaryVersion: 1,
      width: 100,
      height: 100,
      bytes: 1,
      rating: "general" as const,
      createdAt: new Date(Date.UTC(2020, 0, 1 + i)),
    }))
  )
})

afterAll(async () => {
  await db.delete(images).where(inArray(images.contentHash, HASHES))
})

test("o cursor não repete nem pula linhas", async () => {
  const first = await fetchImageFeed({ nsfw: false, limit: 2 })
  expect(first.data).toHaveLength(2)
  expect(first.hasNext).toBe(true)

  const second = await fetchImageFeed({ nsfw: false, limit: 2, cursor: first.cursor ?? undefined })

  const ids = [...first.data, ...second.data].map((row) => row.id)
  expect(new Set(ids).size).toBe(ids.length)

  const dates = [...first.data, ...second.data].map((row) => row.createdAt.getTime())
  expect(dates).toEqual([...dates].sort((a, b) => b - a))
})

test("cursor malformado cai na primeira página em vez de estourar", () => {
  expect(decodeCursor("lixo")).toBeUndefined()
  expect(decodeCursor(undefined)).toBeUndefined()

  const round = { createdAt: new Date("2020-01-01T00:00:00.000Z"), id: "abc" }
  expect(decodeCursor(encodeCursor(round))).toEqual(round)
})
