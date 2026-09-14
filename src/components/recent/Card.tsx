import { ImageView } from "@/components/ImageView"
import type { Tag } from "@/types/Tag"

interface CardProps {
  url: string
  id: string
  tag: Tag[]
}

export function Card({ url, id, tag }: CardProps) {
  const tags = tag.map((item) => `#${item.name} `)
  return (
    <article className="h-full w-full max-w-xl overflow-hidden rounded-lg">
      <div className="flex flex-col bg-lucide-800 p-2">
        <ImageView id={id} url={url} width={1000} height={1000} className="block shadow-none" priority />
        <div className="flex flex-col gap-2 pt-2">
          <div className="flex select-none flex-wrap gap-2 text-xs text-zinc-400/80 sm:text-sm">{tags}</div>
        </div>
      </div>
    </article>
  )
}
