import { inArray } from "drizzle-orm"
import { NextRequest } from "next/server"
import { afterAll, beforeAll, expect, test } from "vitest"
import { GET } from "@/app/api/images/route"
import { db } from "@/db/client"
import { images } from "@/db/schema"
import { encodeCursor } from "@/services/images"

const call = (qs: string) => GET(new NextRequest(`http://localhost/api/images${qs}`))

// Prefixo próprio: schema.test.ts varre 'test/%' e images.test.ts usa
// 'svc-test/...' — 'route-test/...' não bate em nenhum dos dois, então os
// três arquivos podem rodar em paralelo contra o mesmo banco sem se pisar.
// rating "explicit" (nsfw=true) por um motivo além do nome: images.test.ts
// pagina o feed nsfw=false inteiro e conta linhas — uma fixture nsfw=false
// aqui contaminaria essa contagem quando os arquivos rodam em paralelo.
const ROUTE_TEST_HASHES = ["r0".padEnd(64, "0"), "r1".padEnd(64, "0")]
let newestRowCursor = ""
let newestRowId = ""

beforeAll(async () => {
  const rows = await db
    .insert(images)
    .values([
      {
        contentHash: ROUTE_TEST_HASHES[0],
        cloudinaryId: "route-test/cursor-newest",
        cloudinaryVersion: 1,
        width: 100,
        height: 100,
        bytes: 1,
        rating: "explicit" as const,
        createdAt: new Date(Date.UTC(2021, 0, 2)),
      },
      {
        contentHash: ROUTE_TEST_HASHES[1],
        cloudinaryId: "route-test/cursor-oldest",
        cloudinaryVersion: 1,
        width: 100,
        height: 100,
        bytes: 1,
        rating: "explicit" as const,
        createdAt: new Date(Date.UTC(2021, 0, 1)),
      },
    ])
    .returning({ id: images.id, contentHash: images.contentHash, createdAt: images.createdAt })

  const newest = rows.find((r) => r.contentHash === ROUTE_TEST_HASHES[0])
  if (!newest) {
    throw new Error("fixture insert failed")
  }
  newestRowCursor = encodeCursor({ createdAt: newest.createdAt, id: newest.id })
  newestRowId = newest.id
})

afterAll(async () => {
  await db.delete(images).where(inArray(images.contentHash, ROUTE_TEST_HASHES))
})

test("page fora de faixa é rejeitado, não coagido", async () => {
  expect((await call("?page=0")).status).toBe(400)
  expect((await call("?page=-5")).status).toBe(400)
  expect((await call("?page=abc")).status).toBe(400)
})

test("limit tem teto", async () => {
  expect((await call("?limit=99999")).status).toBe(400)
})

test("tag precisa ser uuid", async () => {
  expect((await call("?tag=1girl")).status).toBe(400)
})

test("cursor lixo não derruba a rota", async () => {
  expect((await call("?tag=00000000-0000-4000-8000-000000000000&cursor=%%%")).status).toBe(200)
})

test("sem parâmetros devolve a primeira página SFW", async () => {
  const response = await call("")
  expect(response.status).toBe(200)

  const body = await response.json()
  expect(body.page).toBe(1)
  expect(Array.isArray(body.data)).toBe(true)
})

// A rota de scroll infinito: cursor sem tag tem que ir para fetchImageFeed,
// não para fetchImagePage. O formato do corpo é a prova — só o feed devolve
// hasNext/cursor, só a paginação por offset devolve page/total/totalPage.
test("cursor sem tag vai para o feed, não para a paginação por offset", async () => {
  const response = await call(`?nsfw=true&cursor=${encodeURIComponent(newestRowCursor)}`)
  expect(response.status).toBe(200)

  const body = await response.json()
  expect(body).toHaveProperty("data")
  expect(body).toHaveProperty("hasNext")
  expect(body).toHaveProperty("cursor")
  expect(body).not.toHaveProperty("page")
  expect(body).not.toHaveProperty("total")
  expect(body).not.toHaveProperty("totalPage")

  const ids = body.data.map((row: { id: string }) => row.id)
  expect(ids).not.toContain(newestRowId)
})
