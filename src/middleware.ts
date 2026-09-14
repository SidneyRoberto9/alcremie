import { type NextRequest, NextResponse } from "next/server"

export const middleware = (request: NextRequest) => {
  if (request.cookies.get("age_ok")?.value === "1") {
    return NextResponse.next()
  }

  const url = request.nextUrl.clone()
  url.pathname = "/nsfw-validation"
  url.search = ""

  return NextResponse.redirect(url)
}

// "/nsfw" sozinho seria redundante: o grupo de parâmetro de "/nsfw/:path*" é
// opcional, então esse padrão já casa com o "/nsfw" nu (confirmado
// compilando os dois com o path-to-regexp do próprio Next — ver
// middleware.test.ts).
export const config = { matcher: ["/nsfw/:path*"] }
