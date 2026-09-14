import { NextRequest } from "next/server"
import { expect, test } from "vitest"
import { config, middleware } from "@/middleware"

const request = (path: string, cookie?: string) => {
  const next = new NextRequest(`https://alcremie.test${path}`)

  if (cookie !== undefined) {
    next.cookies.set("age_ok", cookie)
  }

  return next
}

test("sem cookie, /nsfw redireciona para a validação", () => {
  const response = middleware(request("/nsfw"))

  expect(response.status).toBe(307)
  expect(response.headers.get("location")).toContain("/nsfw-validation")
})

test("cookie inválido não passa", () => {
  expect(middleware(request("/nsfw", "sim")).status).toBe(307)
})

test("com cookie válido, passa", () => {
  expect(middleware(request("/nsfw", "1")).status).toBe(200)
})

test("query string não contorna o gate", () => {
  expect(middleware(request("/nsfw?page=2")).status).toBe(307)
})

test("cookie com valor inesperado (vazio) não passa", () => {
  expect(middleware(request("/nsfw", "")).status).toBe(307)
})

test("redirect aponta para /nsfw-validation sem querystring da origem", () => {
  const response = middleware(request("/nsfw?page=2"))
  expect(response.headers.get("location")).toBe("https://alcremie.test/nsfw-validation")
})

// O gate mudou de rota (era /nsfw/validation, agora é o sibling /nsfw-validation).
// O middleware em si não olha o pathname — quem decide se ele roda é o
// `matcher` abaixo, resolvido pelo Next antes de chamar middleware(). Testamos
// a semântica real dos dois formatos de padrão usados no matcher (literal e
// `/base/:path*`) para garantir que "/nsfw-validation" nunca é interceptada —
// um matcher errado aqui causaria um loop de redirecionamento infinito.
const matchesMatcher = (pathname: string) =>
  config.matcher.some((pattern) => {
    if (pattern.endsWith("/:path*")) {
      const base = pattern.slice(0, -"/:path*".length)
      return pathname === base || pathname.startsWith(`${base}/`)
    }
    return pathname === pattern
  })

test("matcher não intercepta /nsfw-validation", () => {
  expect(matchesMatcher("/nsfw-validation")).toBe(false)
})

test("matcher intercepta /nsfw e subrotas", () => {
  expect(matchesMatcher("/nsfw")).toBe(true)
  expect(matchesMatcher("/nsfw/123")).toBe(true)
})
