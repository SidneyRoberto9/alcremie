import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { fetchImageFeedWithTags, fetchImagePage, fetchImagesByTag } from "@/services/images"
import { countRequest } from "@/services/stats"

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

  await countRequest()

  // tag manda mesmo com cursor ausente; cursor sem tag vai para o feed geral.
  // Sem essa ordem, um scroll do /recent sem tag cairia em fetchImagePage e
  // repaginaria do zero a cada rolagem.
  if (tag) {
    return NextResponse.json(await fetchImagesByTag({ tagId: tag, nsfw, limit, cursor }))
  }

  // Só quem pagina pelo cursor é o /recent, e o card dele precisa das tags —
  // por isso a versão com join aqui, não em fetchImagePage logo abaixo.
  if (cursor) {
    return NextResponse.json(await fetchImageFeedWithTags({ nsfw, limit, cursor }))
  }

  return NextResponse.json(await fetchImagePage({ nsfw, page, limit }))
}
