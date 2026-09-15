"use server"

import { createHash } from "node:crypto"
import { v2 as cloudinary } from "cloudinary"
import { revalidatePath } from "next/cache"
import sharp from "sharp"
import { createImageWithTags } from "@/services/images"
import { ratingOf, tagImage } from "@/services/tagger"

const MAX_BYTES = 8 * 1024 * 1024

type UploadResult = { ok: true; data: { id: string; rating: string; tags: string[] } } | { ok: false; error: string }

// Um arquivo por chamada: o cliente (use-upload-queue.ts) controla a
// concorrência com um pool limitado — a sessão ONNX é reusada
// (services/tagger.ts), então o limite existe pra CPU/memória de inferência,
// não pra evitar recarregar o modelo.
export const uploadOne = async (formData: FormData): Promise<UploadResult> => {
  const file = formData.get("file")

  if (!(file instanceof File)) {
    return { ok: false, error: "no file" }
  }

  if (file.size > MAX_BYTES) {
    return { ok: false, error: "file too large" }
  }

  const original = Buffer.from(await file.arrayBuffer())

  const [detected, rating, webp] = await Promise.all([
    tagImage(original),
    ratingOf(original),
    sharp(original).webp({ quality: 90 }).toBuffer(),
  ])

  const meta = await sharp(webp).metadata()

  const uploaded = await new Promise<{ public_id: string; version: number }>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: "alcremie" }, (error, result) => (result ? resolve(result) : reject(error)))
      .end(webp)
  })

  const id = await createImageWithTags(
    {
      // Hash do arquivo ORIGINAL, não do webp recodificado: a coluna
      // identifica o binário submetido (ver comentário em db/schema.ts), e
      // sharp/libwebp não são garantidos byte-idênticos entre versões — hashear
      // a saída faria a deduplicação depender do toolchain, quebrando em
      // silêncio numa atualização.
      contentHash: createHash("sha256").update(original).digest("hex"),
      cloudinaryId: uploaded.public_id,
      cloudinaryVersion: uploaded.version,
      width: meta.width as number,
      height: meta.height as number,
      bytes: webp.byteLength,
      format: "webp",
      rating,
    },
    detected
  )

  if (!id) {
    return { ok: false, error: "duplicate" }
  }

  // "/" com type "layout" invalida o layout raiz e tudo abaixo dele: home (ISR
  // de 60s), gallery, nsfw, recent, /api/images e /api/stats. Revalidar rota a
  // rota deixaria uma listagem velha para trás toda vez que alguém criasse uma.
  revalidatePath("/", "layout")

  return { ok: true, data: { id, rating, tags: detected.slice(0, 8).map((tag) => tag.name) } }
}
