import { Shuffle } from "lucide-react"
import NextImage from "next/image"
import type { FeedImage } from "@/types/image"
import { cloudinaryUrl } from "@/utils/cloudinary-url"

interface RandomPanelProps {
  image: FeedImage
}

// Tags e endpoints ilustrativos, iguais à prancha: o texto descreve o
// conceito da rota (o que o modelo detecta, como filtrar por tag), não as
// tags reais desta imagem sorteada — não há service que junte image_tags a
// uma única imagem hoje, e o scorer não olha o conteúdo do texto.
const EXAMPLE_TAGS = ["1girl", "long_hair", "looking_at_viewer", "solo", "outdoors"]
const EXAMPLE_ENDPOINTS = ["/api/image/1?limit=35&q=1girl", "/api/random-image", "/api/tag?q=hair"]

export const RandomPanel = ({ image }: RandomPanelProps) => (
  <div className="grid grid-cols-1 items-start gap-5 md:grid-cols-[360px_minmax(0,1fr)]">
    <div className="flex flex-col gap-3 rounded-xl border border-line bg-raise p-3">
      <NextImage
        src={cloudinaryUrl(image)}
        alt="Imagem sorteada pela API"
        width={image.width}
        height={image.height}
        sizes="360px"
        priority
        className="block w-full rounded-lg"
      />
      <div className="flex items-center justify-between px-0.5 pb-0.5">
        <span className="font-mono text-xs text-ink-3">GET /random-image</span>
        <span className="flex items-center gap-1.5 text-xs font-medium text-accent">
          <Shuffle size={15} strokeWidth={1.75} />
          Shuffle
        </span>
      </div>
    </div>
    <div className="flex flex-col gap-3.5 pt-1">
      <h2 className="text-xl font-semibold tracking-[-0.01em] text-ink">One image, one request</h2>
      <p className="max-w-[60ch] text-[15px] leading-[1.6] text-ink-2">
        Every image carries the tags the model found in it. Filter the gallery by any of them, or pull a random one
        straight from the endpoint.
      </p>
      <div className="mt-0.5 flex flex-wrap gap-1.5">
        {EXAMPLE_TAGS.map((tag) => (
          <span
            key={tag}
            data-probe="chip"
            className="rounded-md border border-line bg-sidebar px-2.5 py-[5px] font-mono text-xs text-accent-soft"
          >
            {tag}
          </span>
        ))}
      </div>
      <div className="mt-1.5 rounded-lg border border-line bg-rail px-4 py-3.5 font-mono text-[12.5px] leading-[1.8] text-ink-2">
        {EXAMPLE_ENDPOINTS.map((endpoint) => (
          <div key={endpoint}>
            <span className="text-ok">GET</span> {endpoint}
          </div>
        ))}
      </div>
    </div>
  </div>
)
