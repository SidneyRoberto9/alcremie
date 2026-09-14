import Link from "next/link"
import { Masonry } from "@/components/masonry"
import type { FeedImage } from "@/types/image"

interface HeroProps {
  images: FeedImage[]
}

export const Hero = ({ images }: HeroProps) => (
  <div className="relative h-[380px] flex-none overflow-hidden bg-rail">
    <div className="absolute inset-0 p-1.5 opacity-30">
      <Masonry images={images} columns={7} />
    </div>
    <div className="absolute inset-0 bg-gradient-to-b from-rail/[0.55] from-0% via-rail/[0.86] via-55% to-content to-100%" />
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3.5">
      <h1 className="font-display text-[76px] font-bold leading-none tracking-[0.01em] text-accent-soft">Alcremie</h1>
      <p className="max-w-[520px] text-pretty text-center text-[17px] text-ink-2">
        The API for your anime and waifu images, tagged automatically.
      </p>
      <div className="mt-2 flex gap-2.5">
        <Link
          href="/gallery"
          data-probe="btn-primary"
          className="flex h-10 items-center rounded-lg bg-accent px-5 text-sm font-semibold text-rail max-[480px]:h-11"
        >
          Browse gallery
        </Link>
        <a
          href="https://github.com/SidneyRoberto9/alcremie"
          className="flex h-10 items-center rounded-lg border border-line-2 bg-raise px-5 text-sm font-medium text-ink max-[480px]:h-11"
        >
          Read the docs
        </a>
      </div>
    </div>
  </div>
)
