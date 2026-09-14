import { Sparkles } from "lucide-react"
import NextImage from "next/image"
import type { FeedImageWithTags } from "@/types/image"
import { cloudinaryUrl } from "@/utils/cloudinary-url"

interface CardProps {
  image: FeedImageWithTags
}

// Intl.RelativeTimeFormat em vez de trazer date-fns só para "2 min ago" —
// nenhuma outra tela do rebrand precisa formatar datas ainda.
// Exportado (não só usado aqui) para o teste em feed.test.ts poder provar que
// ele não explode com o createdAt já revivido por reviveFeedPage.
export const timeAgo = (date: Date) => {
  const minutes = Math.round((date.getTime() - Date.now()) / 60_000)
  if (Math.abs(minutes) < 60) {
    return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(minutes, "minute")
  }
  return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(Math.round(minutes / 60), "hour")
}

export const Card = ({ image }: CardProps) => (
  <article className="flex flex-col overflow-hidden rounded-xl border border-line bg-raise">
    <div className="flex items-center gap-2.5 px-3.5 py-3">
      <span className="flex h-7 w-7 flex-none items-center justify-center rounded-lg bg-accent/10 text-accent">
        <Sparkles size={15} strokeWidth={1.75} />
      </span>
      <span className="text-[13.5px] font-medium text-ink">Tagged by the model</span>
      <div className="grow" />
      <span className="font-mono text-xs text-ink-3">{timeAgo(image.createdAt)}</span>
    </div>
    <NextImage
      src={cloudinaryUrl(image, 720)}
      alt=""
      width={image.width}
      height={image.height}
      sizes="(max-width: 640px) 100vw, 620px"
      className="block w-full"
    />
    {image.tags.length > 0 ? (
      <div className="flex flex-wrap gap-1.5 px-3.5 py-3">
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
    ) : null}
  </article>
)
