import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { fetchImageFeed, fetchImagePage, fetchImagesByTag } from "@/services/images"

const querySchema = z.object({
  page: z.coerce.number().int().min(1).max(10_000).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(35),
  nsfw: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
  tag: z.uuid().optional(),
  cursor: z.string().max(256).optional(),
})

export const GET = async (request: NextRequest) => {
  const parsed = querySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams))

  if (!parsed.success) {
    return NextResponse.json({ error: z.treeifyError(parsed.error) }, { status: 400 })
  }

  const { page, limit, nsfw, tag, cursor } = parsed.data

  // tag manda mesmo com cursor ausente; cursor sem tag vai para o feed geral.
  // Sem essa ordem, um scroll do /recent sem tag cairia em fetchImagePage e
  // repaginaria do zero a cada rolagem.
  if (tag) {
    return NextResponse.json(await fetchImagesByTag({ tagId: tag, nsfw, limit, cursor }))
  }

  if (cursor) {
    return NextResponse.json(await fetchImageFeed({ nsfw, limit, cursor }))
  }

  return NextResponse.json(await fetchImagePage({ nsfw, page, limit }))
}
