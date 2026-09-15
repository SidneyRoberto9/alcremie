import { describe, expect, it } from "vitest"
import { createSessionToken, secretEquals, verifySessionToken } from "@/utils/session"

const SECRET = "secret-de-teste"

describe("session token", () => {
  it("aceita um token recém-assinado", () => {
    const token = createSessionToken(Date.now() + 60_000, SECRET)

    expect(verifySessionToken(token, SECRET)).toBe(true)
  })

  it("recusa token expirado", () => {
    const token = createSessionToken(Date.now() - 1, SECRET)

    expect(verifySessionToken(token, SECRET)).toBe(false)
  })

  // O ataque óbvio: esticar a validade no próprio navegador. Sem conferir a
  // assinatura sobre o payload, isso passaria.
  it("recusa validade adulterada com a assinatura antiga", () => {
    const expiresAt = Date.now() + 60_000
    const [, digest] = createSessionToken(expiresAt, SECRET).split(".")

    expect(verifySessionToken(`${expiresAt + 86_400_000}.${digest}`, SECRET)).toBe(false)
  })

  it("recusa token assinado com outro segredo", () => {
    const token = createSessionToken(Date.now() + 60_000, "outro-segredo")

    expect(verifySessionToken(token, SECRET)).toBe(false)
  })

  it("recusa cookie ausente ou malformado", () => {
    expect(verifySessionToken(undefined, SECRET)).toBe(false)
    expect(verifySessionToken("", SECRET)).toBe(false)
    expect(verifySessionToken("sem-ponto", SECRET)).toBe(false)
  })
})

describe("secretEquals", () => {
  it("compara valores de tamanhos diferentes sem estourar", () => {
    expect(secretEquals("abc", "abcdefghij")).toBe(false)
    expect(secretEquals("abc", "abc")).toBe(true)
  })
})
