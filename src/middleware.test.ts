// Sem tipos públicos — são utilitários internos do build do Next, não parte da
// API pública do pacote. É exatamente o preço "de depender da API interna de
// um transitivo" mencionado na revisão: aceito porque é a única forma de
// testar o matcher contra o compilador de verdade em vez de reimplementá-lo.
// @ts-expect-error — sem .d.ts para getMiddlewareMatchers
import { getMiddlewareMatchers } from "next/dist/build/analysis/get-page-static-info.js"
import { getMiddlewareRouteMatcher } from "next/dist/shared/lib/router/utils/middleware-route-matcher.js"
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

// Não há teste "query string não contorna o gate" aqui de propósito.
// middleware() nunca olha request.nextUrl.search — ele só compara o cookie —
// e o matcher também não: getMiddlewareRouteMatcher (abaixo) recebe pathname
// já sem a query como primeiro argumento; a query só entra na decisão via
// `has`/`missing`, que este matcher não usa. Ou seja, uma query string nunca
// participa de nenhuma decisão em nenhuma das duas camadas — não existe
// comportamento nosso para verificar aqui além do que os testes de cookie já
// cobrem. Um teste chamando middleware("/nsfw?page=2") sem cookie apenas
// repetiria o teste "sem cookie" acima sob um nome diferente (ele ficaria
// verde mesmo se query strings passassem a ser lidas de outro jeito, contanto
// que o cookie continuasse ausente) — por isso foi removido em vez de mantido
// como teste oco.

test("cookie com valor inesperado (vazio) não passa", () => {
  expect(middleware(request("/nsfw", "")).status).toBe(307)
})

test("redirect aponta para /nsfw-validation sem querystring da origem", () => {
  const response = middleware(request("/nsfw?page=2"))
  expect(response.headers.get("location")).toBe("https://alcremie.test/nsfw-validation")
})

// O gate mudou de rota (era /nsfw/validation, agora é o sibling /nsfw-validation).
// O middleware em si não olha o pathname — quem decide se ele roda é o
// `matcher` abaixo, resolvido pelo Next antes de chamar middleware(). Um
// matcher errado aqui causaria um loop de redirecionamento infinito, então em
// vez de reimplementar a semântica de path-to-regexp à mão (o que só provaria
// que o meu modelo bate com o meu modelo), compilamos config.matcher com o
// mesmo par de funções que o build do Next usa de verdade —
// getMiddlewareMatchers (fonte -> regex) e getMiddlewareRouteMatcher (regex ->
// função de decisão) — e testamos a função real contra os pathnames reais.
// getMiddlewareRouteMatcher's real type wants a BaseNextRequest/Params for the
// req/query params, used only for the optional `has`/`missing` conditions this
// matcher doesn't declare — irrelevant here, so the function is narrowed down
// to the one argument this test actually needs.
const realMiddlewareMatch = getMiddlewareRouteMatcher(getMiddlewareMatchers(config.matcher, {})) as (
  pathname: string
) => boolean

test("matcher compilado pelo Next intercepta /nsfw e subrotas", () => {
  expect(realMiddlewareMatch("/nsfw")).toBe(true)
  expect(realMiddlewareMatch("/nsfw/123")).toBe(true)
})

test("matcher compilado pelo Next não intercepta /nsfw-validation", () => {
  expect(realMiddlewareMatch("/nsfw-validation")).toBe(false)
})
