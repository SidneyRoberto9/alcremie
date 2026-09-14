import { NextRequest } from "next/server"
import { expect, test } from "vitest"
import { GET } from "@/app/api/images/route"

const call = (qs: string) => GET(new NextRequest(`http://localhost/api/images${qs}`))

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
