import type { NextFetchEvent } from "next/server"
import { NextResponse } from "next/server"
import type { NextAuthRequest } from "next-auth"
import NextAuth from "next-auth"
import { authConfig } from "@/lib/auth.config"

// Instância separada de src/lib/auth.ts: authConfig não importa `@/db`, então
// o bundle do middleware (edge runtime) nunca vê o driver `postgres`. O role
// já está no JWT (gravado pelos callbacks de auth.ts no signIn/route handler,
// que rodam em Node); aqui só decodifica.
const { auth } = NextAuth(authConfig)

// O `auth()` wrapper documentado pelo Auth.js v5 para middleware:
// https://authjs.dev/getting-started/migrating-to-v5#authenticating-server-side
// Ele decodifica o cookie de sessão antes de chamar este callback com
// `request.auth` já preenchido — por isso a função de baixo não chama
// `auth()` ela mesma, e por isso o middleware inteiro passou a ser
// assíncrono (decodificar JWT é inerentemente async; não tem variante
// síncrona nem no /nsfw, que não precisa disso).
export const middleware = auth((request: NextAuthRequest, _event: NextFetchEvent) => {
  if (request.nextUrl.pathname.startsWith("/upload")) {
    if (request.auth?.user?.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url))
    }

    return NextResponse.next()
  }

  if (request.cookies.get("age_ok")?.value === "1") {
    return NextResponse.next()
  }

  const url = request.nextUrl.clone()
  url.pathname = "/nsfw-validation"
  url.search = ""

  return NextResponse.redirect(url)
})

// "/nsfw" sozinho seria redundante: o grupo de parâmetro de "/nsfw/:path*" é
// opcional, então esse padrão já casa com o "/nsfw" nu (confirmado
// compilando os dois com o path-to-regexp do próprio Next — ver
// middleware.test.ts). "/upload/:path*" idem, para o guard de admin.
export const config = { matcher: ["/nsfw/:path*", "/upload/:path*"] }
