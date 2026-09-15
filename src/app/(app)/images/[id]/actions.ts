"use server"

import { v2 as cloudinary } from "cloudinary"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { isAuthenticated } from "@/services/auth"
import { deleteImageById, fetchImageById } from "@/services/images"

type DeleteResult = { ok: false; error: string }

/**
 * Esconder o botão não protege nada — a checagem que vale é esta, no servidor.
 *
 * Ordem: Cloudinary primeiro, banco depois. Falha de rede no provedor é o
 * cenário provável, e abortando antes do DELETE nada some pela metade: dá
 * para tentar de novo. No caso raro do inverso (arquivo apagado, banco falha)
 * sobra uma linha apontando para um arquivo que não existe — e repetir o
 * delete resolve, porque "not found" do Cloudinary é tratado como sucesso.
 */
export const deleteImage = async (id: string): Promise<DeleteResult> => {
  if (!(await isAuthenticated())) {
    return { ok: false, error: "Sign in first." }
  }

  const image = await fetchImageById(id)

  if (!image) {
    return { ok: false, error: "Image not found." }
  }

  // seed/* não vive no Cloudinary (resolve para public/seed/*.webp): não há
  // arquivo remoto para apagar.
  if (!image.cloudinaryId.startsWith("seed/")) {
    try {
      const { result } = await cloudinary.uploader.destroy(image.cloudinaryId, { invalidate: true })

      if (result !== "ok" && result !== "not found") {
        return { ok: false, error: `Cloudinary refused the delete (${result}).` }
      }
    } catch {
      return { ok: false, error: "Could not reach Cloudinary. Nothing was deleted." }
    }
  }

  if (!(await deleteImageById(id))) {
    return { ok: false, error: "Image not found." }
  }

  // Mesmo alcance do upload: invalida home, gallery, nsfw, recent e as rotas
  // públicas de uma vez, em vez de deixar uma listagem velha para trás.
  revalidatePath("/", "layout")
  redirect("/gallery")
}
