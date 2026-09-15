import { Image as ImageIcon } from "lucide-react"
import type { Metadata } from "next"
import NextImage from "next/image"
import { notFound } from "next/navigation"
import { Fragment } from "react"
import { z } from "zod"
import { DeleteDialog } from "@/components/images/delete-dialog"
import { Masonry } from "@/components/masonry"
import { AgeGate } from "@/components/nsfw/age-gate"
import { Topbar } from "@/components/shell/topbar"
import { isAuthenticated } from "@/services/auth"
import { fetchImageById, fetchSimilarImages, incrementViews } from "@/services/images"
import { cloudinaryUrl } from "@/utils/cloudinary-url"
import { formatBytes } from "@/utils/format-bytes"

export const metadata: Metadata = { title: "Image | Alcremie" }

// Cada abertura grava um view — não pode ser prerenderizada nem cacheada,
// ou o contador (e o corte de similaridade, que depende dele indiretamente
// via tags recém-gravadas) nunca reflete visitas novas.
export const dynamic = "force-dynamic"

interface PageProps {
  params: Promise<{ id: string }>
}

const Page = async ({ params }: PageProps) => {
  const { id } = await params

  if (!z.uuid().safeParse(id).success) {
    notFound()
  }

  const image = await fetchImageById(id)

  if (!image) {
    notFound()
  }

  // O view não depende da similaridade nem da sessão, então rodam juntos.
  const [similar, canDelete] = await Promise.all([
    fetchSimilarImages(image.id, image.isNsfw),
    isAuthenticated(),
    incrementViews(image.id),
  ])

  const content = (
    <Fragment>
      <div className="grid grow grid-cols-1 gap-5 p-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex flex-col gap-3 rounded-xl border border-line bg-raise p-3">
          <div className="flex items-center justify-center overflow-hidden rounded-lg bg-rail">
            <NextImage
              src={cloudinaryUrl(image)}
              alt=""
              width={image.width}
              height={image.height}
              sizes="(max-width: 1024px) 100vw, 700px"
              priority
              className="block max-h-[70vh] w-auto"
            />
          </div>
          <div className="flex items-center justify-between px-0.5 pb-0.5">
            <span className="font-mono text-xs text-ink-3">
              {image.width} × {image.height} · {image.format.toUpperCase()} · {formatBytes(image.bytes)}
            </span>
            <span className="flex items-center gap-1.5 font-mono text-xs text-ink-3">
              <ImageIcon size={14} strokeWidth={1.75} />
              {image.views.toLocaleString()} views
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3.5">
          <div className="flex flex-col rounded-xl border border-line bg-raise">
            <div className="flex items-center justify-between px-3.5 py-3">
              <span className="font-mono text-[11px] tracking-[0.1em] text-ink-3">RATING</span>
              <span className="rounded-full border border-ok/25 bg-ok/10 px-2.5 py-1 font-mono text-xs text-ok">
                {image.rating}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-line px-3.5 py-3">
              <span className="font-mono text-[11px] tracking-[0.1em] text-ink-3">RESOLUTION</span>
              <span className="text-[13.5px] text-ink">
                {image.width} × {image.height}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-line px-3.5 py-3">
              <span className="font-mono text-[11px] tracking-[0.1em] text-ink-3">UPLOADED</span>
              <span className="text-[13.5px] text-ink">
                {image.createdAt.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-line px-3.5 py-3">
              <span className="font-mono text-[11px] tracking-[0.1em] text-ink-3">ID</span>
              <span className="font-mono text-xs text-ink-2">{image.id}</span>
            </div>
          </div>

          {image.tags.length > 0 ? (
            <div className="flex flex-col rounded-xl border border-line bg-raise">
              <div className="border-b border-line px-3.5 py-3 text-[13.5px] font-medium text-ink">Tags</div>
              <div className="flex flex-wrap gap-1.5 p-3.5">
                {image.tags.map((tag) => (
                  <span
                    key={tag}
                    data-probe="chip"
                    className="rounded-md border border-line bg-sidebar px-2.5 py-[5px] font-mono text-xs text-accent-soft"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* fetchSimilarImages já aplica o corte de 98 pontos — chegando aqui
          vazio, a seção simplesmente não existe, sem placeholder de "nada encontrado". */}
      {similar.length > 0 ? (
        <div className="flex flex-col gap-3 border-t border-line px-6 py-5">
          <div className="flex items-center gap-2">
            <h2 className="text-[13.5px] font-medium text-ink">Similar images</h2>
            <span className="font-mono text-xs text-ink-3">≥ 98% tag match</span>
          </div>
          <Masonry images={similar} columns={similar.length} linked />
        </div>
      ) : null}
    </Fragment>
  )

  return (
    <Fragment>
      <Topbar icon={ImageIcon} title="Image" right={canDelete ? <DeleteDialog imageId={image.id} /> : null} />
      {image.isNsfw ? <AgeGate>{content}</AgeGate> : content}
    </Fragment>
  )
}

export default Page
