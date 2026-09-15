import { createHash } from "node:crypto"
import { readFileSync } from "node:fs"
import { eq } from "drizzle-orm"
import { afterAll, beforeAll, expect, test, vi } from "vitest"
import { uploadOne } from "@/app/(app)/upload/actions"
import { db } from "@/db/client"
import { images } from "@/db/schema"

// Sem CLOUDINARY_URL de verdade neste ambiente (o .env.local só tem
// DATABASE_URL) — sem isto toda chamada tentaria uma rede que não existe. O
// upload em si não é o que estes testes verificam.
vi.mock("cloudinary", () => ({
  v2: {
    uploader: {
      upload_stream: (
        _options: unknown,
        callback: (error: unknown, result?: { public_id: string; version: number }) => void
      ) => ({
        end: () => callback(null, { public_id: "actions-test/mock", version: 1 }),
      }),
    },
  },
}))

// revalidatePath exige o store de request do Next, que não existe chamando a
// server action direto daqui. O que importa testar é o upload, não o purge do
// cache.
vi.mock("next/cache", () => ({ revalidatePath: () => {} }))

const fileFrom = (buffer: Buffer, name: string) => {
  const formData = new FormData()
  formData.append("file", new File([buffer as unknown as BlobPart], name, { type: "image/jpeg" }))
  return formData
}

const SAMPLE = readFileSync("fixtures/sample.jpg")
const SAMPLE_HASH = createHash("sha256").update(SAMPLE).digest("hex")

const cleanup = () => db.delete(images).where(eq(images.contentHash, SAMPLE_HASH))

beforeAll(cleanup)
afterAll(cleanup)

test("chamada sem arquivo é recusada", async () => {
  const result = await uploadOne(new FormData())

  expect(result).toEqual({ ok: false, error: "no file" })
})

test("arquivo maior que 8 MB é recusado", async () => {
  const big = Buffer.alloc(8 * 1024 * 1024 + 1)
  const result = await uploadOne(fileFrom(big, "big.jpg"))

  expect(result).toEqual({ ok: false, error: "file too large" })
})

test("contentHash duplicado é reportado, não inserido de novo", { timeout: 120_000 }, async () => {
  const first = await uploadOne(fileFrom(SAMPLE, "dup.jpg"))
  expect(first.ok).toBe(true)

  const second = await uploadOne(fileFrom(SAMPLE, "dup.jpg"))
  expect(second).toEqual({ ok: false, error: "duplicate" })

  const rows = await db.select({ id: images.id }).from(images).where(eq(images.contentHash, SAMPLE_HASH))
  expect(rows).toHaveLength(1)
})
