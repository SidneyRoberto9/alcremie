import { cookies } from "next/headers"
import { createSessionToken, secretEquals, verifySessionToken } from "@/utils/session"

const COOKIE = "alcremie_session"
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7

/**
 * Login de senha única: não há cadastro, e a tabela `users` continua sem
 * coluna de senha de propósito — quem administra o acervo é uma pessoa só.
 * Sem AUTH_PASSWORD ou AUTH_SECRET no ambiente, o login recusa tudo: aceitar
 * qualquer senha quando a variável falta é exatamente como essa porta fica
 * aberta em produção sem ninguém perceber.
 */
export const signIn = async (password: string) => {
  const expected = process.env.AUTH_PASSWORD
  const secret = process.env.AUTH_SECRET

  if (!expected || !secret || !secretEquals(password, expected)) {
    return false
  }

  const expiresAt = Date.now() + MAX_AGE_SECONDS * 1000
  const store = await cookies()

  store.set(COOKIE, createSessionToken(expiresAt, secret), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  })

  return true
}

export const isAuthenticated = async () => {
  const secret = process.env.AUTH_SECRET

  if (!secret) {
    return false
  }

  const store = await cookies()
  return verifySessionToken(store.get(COOKIE)?.value, secret)
}
