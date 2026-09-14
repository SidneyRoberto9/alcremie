import { type NextRequest, NextResponse } from "next/server"
import { randomImage } from "@/services/images"

export const dynamic = "force-dynamic"

export const GET = async (request: NextRequest) => {
  const image = await randomImage(request.nextUrl.searchParams.get("nsfw") === "true")

  if (!image) {
    return NextResponse.json({ error: "no images" }, { status: 404 })
  }

  return NextResponse.json({ image })
}
