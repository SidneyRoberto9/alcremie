// Sem tipos públicos — são utilitários internos do build do Next, não parte da
// API pública do pacote. É exatamente o preço "de depender da API interna de
// um transitivo" mencionado na revisão: aceito porque é a única forma de
// testar o matcher contra o compilador de verdade em vez de reimplementá-lo.
// @ts-expect-error — sem .d.ts para getMiddlewareMatchers
import { getMiddlewareMatchers } from "next/dist/build/analysis/get-page-static-info.js"
import { getMiddlewareRouteMatcher } from "next/dist/shared/lib/router/utils/middleware-route-matcher.js"
import type { NextFetchEvent } from "next/server"
import { NextRequest } from "next/server"
import { encode } from "next-auth/jwt"
import { expect, test } from "vitest"
import { config, middleware } from "@/middleware"

const request = (path: string, cookie?: string) => {
  const next = new NextRequest(`https://alcremie.test${path}`)

  if (cookie !== undefined) {
    next.cookies.set("age_ok", cookie)
  }

  return next
}

// O nome do cookie de sessão do Auth.js depende do protocolo da URL
// (`__Secure-` prefix em https) — ver defaultCookies em @auth/core. O
// middleware.ts real decodifica esse cookie com o mesmo AUTH_SECRET; para
// testar o guard de /upload sem um provedor OAuth de verdade, assinamos um
// token com a mesma função (`encode`, de next-auth/jwt) que o próprio
// Auth.js usa para emitir sessões, e colocamos no cookie certo.
const SESSION_COOKIE = "__Secure-authjs.session-token"

const requestAsRole = async (path: string, role: "default" | "admin") => {
  const token = await encode({
    secret: process.env.AUTH_SECRET as string,
    salt: SESSION_COOKIE,
    token: { sub: "11111111-1111-1111-1111-111111111111", role, email: "user@test.dev" },
  })

  const next = new NextRequest(`https://alcremie.test${path}`)
  next.cookies.set(SESSION_COOKIE, token)

  return next
}

// O middleware passou a chamar auth() (Tarefa 8) para o guard de /upload, e
// decodificar um JWT é inerentemente assíncrono — não existe variante síncrona
// nem para o caminho /nsfw, que não precisa disso. Isso tornou a função
// exportada async, então os testes abaixo ganharam `await` e o segundo
// argumento (event) que o tipo NextMiddleware exige; as asserções em si — o
// que está sendo verificado — não mudaram.
const event = {} as NextFetchEvent

test("sem cookie, /nsfw redireciona para a validação", async () => {
  const response = await middleware(request("/nsfw"), event)

  expect(response?.status).toBe(307)
  expect(response?.headers.get("location")).toContain("/nsfw-validation")
})

test("cookie inválido não passa", async () => {
  const response = await middleware(request("/nsfw", "sim"), event)
  expect(response?.status).toBe(307)
})

test("com cookie válido, passa", async () => {
  const response = await middleware(request("/nsfw", "1"), event)
  expect(response?.status).toBe(200)
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

test("cookie com valor inesperado (vazio) não passa", async () => {
  const response = await middleware(request("/nsfw", ""), event)
  expect(response?.status).toBe(307)
})

test("redirect aponta para /nsfw-validation sem querystring da origem", async () => {
  const response = await middleware(request("/nsfw?page=2"), event)
  expect(response?.headers.get("location")).toBe("https://alcremie.test/nsfw-validation")
})

// Tarefa 8: fecha o buraco crítico do §09 — POST /api/upload (e a página
// /upload) não tinham guard nenhum. Os três testes abaixo provam por
// inversão: comentar o bloco `if (request.nextUrl.pathname.startsWith
// ("/upload"))` em middleware.ts os deixa vermelhos (visitante anônimo cai
// no fallback /nsfw-validation via NextResponse.next do age_ok ausente — na
// verdade cai direto no redirect de /nsfw-validation, já que o cookie
// age_ok não existe — então nenhum dos três passaria a 200/redirect-para-"/"
// esperado). Resultado registrado no relatório da tarefa.
test("visitante anônimo em /upload é redirecionado para /", async () => {
  const response = await middleware(request("/upload"), event)

  expect(response?.status).toBe(307)
  expect(response?.headers.get("location")).toBe("https://alcremie.test/")
})

test("usuário logado sem role admin em /upload é redirecionado para /", async () => {
  const response = await middleware(await requestAsRole("/upload", "default"), event)

  expect(response?.status).toBe(307)
  expect(response?.headers.get("location")).toBe("https://alcremie.test/")
})

test("usuário logado com role admin em /upload passa", async () => {
  const response = await middleware(await requestAsRole("/upload", "admin"), event)

  expect(response?.status).toBe(200)
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

test("matcher compilado pelo Next intercepta /upload e subrotas", () => {
  expect(realMiddlewareMatch("/upload")).toBe(true)
  expect(realMiddlewareMatch("/upload/123")).toBe(true)
})
