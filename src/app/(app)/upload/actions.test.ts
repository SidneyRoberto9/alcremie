import { createHash } from "node:crypto"
import { readFileSync } from "node:fs"
import { eq } from "drizzle-orm"
import type { Session } from "next-auth"
import { afterAll, beforeAll, expect, test, vi } from "vitest"
import { uploadOne } from "@/app/(app)/upload/actions"
import { db } from "@/db/client"
import { images } from "@/db/schema"
import { auth } from "@/lib/auth"

// auth() de verdade decodifica um cookie de sessão via next/headers, que só
// existe dentro do request scope de uma rota/action real do Next — fora dele
// (aqui) ele estoura. O guard de role em cima do resultado de auth() é o que
// este arquivo testa, não a decodificação do JWT em si (isso já é coberto,
// com JWT real, em middleware.test.ts).
vi.mock("@/lib/auth", () => ({ auth: vi.fn() }))

// Sem CLOUDINARY_URL de verdade neste ambiente (o .env.local só tem
// DATABASE_URL/AUTH_SECRET) — sem isto toda chamada tentaria uma rede que não
// existe. O upload em si não é o que estes três testes verificam.
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

const asSession = (role: "admin" | "default" | null) =>
  (role ? { user: { id: "actions-test-user", role, email: "actions-test@test.dev" } } : null) as Session | null

// auth() é uma função com sobrecargas (sessão / middleware / RSC) — o tipo
// inferido de vi.mocked(auth) trava na sobrecarga de middleware, que não
// aceita null nem Session. O cast abaixo devolve só o formato que o mock
// (vi.fn() puro, do factory acima) de fato tem em runtime.
const setSession = (session: Session | null) =>
  (auth as unknown as { mockResolvedValue: (value: Session | null) => void }).mockResolvedValue(session)

const fileFrom = (buffer: Buffer, name: string) => {
  const formData = new FormData()
  formData.append("file", new File([buffer as unknown as BlobPart], name, { type: "image/jpeg" }))
  return formData
}

const DUMMY = Buffer.from("not-an-image")
const SAMPLE = readFileSync("fixtures/sample.jpg")
const SAMPLE_HASH = createHash("sha256").update(SAMPLE).digest("hex")

const cleanup = () => db.delete(images).where(eq(images.contentHash, SAMPLE_HASH))

beforeAll(cleanup)
afterAll(cleanup)

test("chamador sem role admin é recusado", async () => {
  setSession(asSession("default"))

  const result = await uploadOne(fileFrom(DUMMY, "x.jpg"))

  expect(result).toEqual({ ok: false, error: "not allowed" })
})

test("chamador sem sessão nenhuma é recusado", async () => {
  setSession(asSession(null))

  const result = await uploadOne(fileFrom(DUMMY, "x.jpg"))

  expect(result).toEqual({ ok: false, error: "not allowed" })
})

test("arquivo maior que 8 MB é recusado", async () => {
  setSession(asSession("admin"))

  const big = Buffer.alloc(8 * 1024 * 1024 + 1)
  const result = await uploadOne(fileFrom(big, "big.jpg"))

  expect(result).toEqual({ ok: false, error: "file too large" })
})

test("contentHash duplicado é reportado, não inserido de novo", { timeout: 120_000 }, async () => {
  setSession(asSession("admin"))

  const first = await uploadOne(fileFrom(SAMPLE, "dup.jpg"))
  expect(first.ok).toBe(true)

  const second = await uploadOne(fileFrom(SAMPLE, "dup.jpg"))
  expect(second).toEqual({ ok: false, error: "duplicate" })

  const rows = await db.select({ id: images.id }).from(images).where(eq(images.contentHash, SAMPLE_HASH))
  expect(rows).toHaveLength(1)
})
