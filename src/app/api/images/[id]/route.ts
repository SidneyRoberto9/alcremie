import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/db/client"
import { images } from "@/db/schema"

// Única rota que fala com @/db direto: precisa do `with` relacional do query
// builder para trazer as tags junto, o que os services não expõem hoje.
export const GET = async (_request: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params

  if (!z.uuid().safeParse(id).success) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 })
  }

  const image = await db.query.images.findFirst({
    where: eq(images.id, id),
    with: { imageTags: { with: { tag: true } } },
  })

  if (!image) {
    return NextResponse.json({ error: "not found" }, { status: 404 })
  }

  return NextResponse.json({ image })
}
