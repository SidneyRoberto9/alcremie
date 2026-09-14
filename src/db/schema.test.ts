import { eq, sql } from "drizzle-orm"
import { afterAll, expect, test } from "vitest"
import { db } from "@/db/client"
import { images } from "@/db/schema"

const base = {
  cloudinaryVersion: 1,
  width: 100,
  height: 200,
  bytes: 1234,
}

afterAll(async () => {
  await db.delete(images).where(sql`${images.cloudinaryId} LIKE 'test/%'`)
})

test("is_nsfw é derivado do rating, não gravado", async () => {
  const [row] = await db
    .insert(images)
    .values({ ...base, contentHash: "a".repeat(64), cloudinaryId: "test/derived", rating: "explicit" })
    .returning({ id: images.id, isNsfw: images.isNsfw })

  expect(row.isNsfw).toBe(true)

  const [safe] = await db
    .insert(images)
    .values({ ...base, contentHash: "b".repeat(64), cloudinaryId: "test/safe", rating: "general" })
    .returning({ isNsfw: images.isNsfw })

  expect(safe.isNsfw).toBe(false)
})

test("content_hash duplicado é rejeitado", async () => {
  const values = { ...base, contentHash: "c".repeat(64), cloudinaryId: "test/dup-1", rating: "general" as const }

  await db.insert(images).values(values)

  await expect(db.insert(images).values({ ...values, cloudinaryId: "test/dup-2" })).rejects.toThrow()
})

test("apagar imagem leva as tags junto, sem código nenhum", async () => {
  const [row] = await db
    .insert(images)
    .values({ ...base, contentHash: "d".repeat(64), cloudinaryId: "test/cascade", rating: "general" })
    .returning({ id: images.id })

  await db.delete(images).where(eq(images.id, row.id))

  const orphans = await db.execute(sql`SELECT count(*)::int AS n FROM image_tags WHERE image_id = ${row.id}`)

  expect(orphans[0].n).toBe(0)
})
