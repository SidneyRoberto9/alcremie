import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { randomImage } from "@/services/images"
import { countRequest } from "@/services/stats"

export const dynamic = "force-dynamic"

const querySchema = z.object({
  nsfw: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
})

export const GET = async (request: NextRequest) => {
  const parsed = querySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams))

  if (!parsed.success) {
    return NextResponse.json({ error: z.treeifyError(parsed.error) }, { status: 400 })
  }

  await countRequest()

  const image = await randomImage(parsed.data.nsfw)

  if (!image) {
    return NextResponse.json({ error: "no images" }, { status: 404 })
  }

  return NextResponse.json({ image })
}
