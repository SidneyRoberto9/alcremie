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

export const config = { matcher: ["/nsfw/:path*", "/nsfw"] }
