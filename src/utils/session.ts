import { createHash, createHmac, timingSafeEqual } from "node:crypto"

// Não há tabela de sessões: o cookie carrega a própria validade e a assinatura
// que prova que ela não foi editada no navegador. Um payload maior (id de
// usuário, papel) só faria sentido quando existir mais de uma conta — hoje é
// uma senha só.
const sign = (payload: string, secret: string) => createHmac("sha256", secret).update(payload).digest("hex")

export const createSessionToken = (expiresAt: number, secret: string) =>
  `${expiresAt}.${sign(String(expiresAt), secret)}`

export const verifySessionToken = (token: string | undefined, secret: string, now = Date.now()) => {
  const [rawExpiresAt, digest] = token?.split(".") ?? []

  if (!rawExpiresAt || !digest) {
    return false
  }

  if (!secretEquals(digest, sign(rawExpiresAt, secret))) {
    return false
  }

  const expiresAt = Number(rawExpiresAt)
  return Number.isFinite(expiresAt) && expiresAt > now
}

/**
 * Compara em tempo constante. Passa pelo sha256 antes porque timingSafeEqual
 * exige buffers do mesmo tamanho — comparar comprimentos na mão vazaria o
 * tamanho da senha e ainda estouraria exceção em entrada de tamanho diferente.
 */
export const secretEquals = (left: string, right: string) =>
  timingSafeEqual(createHash("sha256").update(left).digest(), createHash("sha256").update(right).digest())
