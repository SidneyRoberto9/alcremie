import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { searchTags } from "@/services/tags"

const querySchema = z.object({
  q: z.string().max(64).default(""),
  limit: z.coerce.number().int().min(1).max(50).default(25),
})

export const GET = async (request: NextRequest) => {
  const parsed = querySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams))

  if (!parsed.success) {
    return NextResponse.json({ error: z.treeifyError(parsed.error) }, { status: 400 })
  }

  return NextResponse.json({ tags: await searchTags(parsed.data.q, parsed.data.limit) })
}
