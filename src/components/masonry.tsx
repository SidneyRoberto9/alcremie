import NextImage from "next/image"
import type { FeedImage } from "@/types/image"
import { cloudinaryUrl } from "@/utils/cloudinary-url"

const solidBlur = (hex: string) =>
  `data:image/svg+xml;base64,${Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="4" height="4"><rect width="4" height="4" fill="${hex}"/></svg>`
  ).toString("base64")}`

interface MasonryProps {
  images: FeedImage[]
  columns?: number
}

export const Masonry = ({ images, columns = 5 }: MasonryProps) => {
  const buckets: FeedImage[][] = Array.from({ length: columns }, () => [])
  images.forEach((image, index) => {
    buckets[index % columns].push(image)
  })

  return (
    <div
      data-probe="masonry"
      className="grid gap-2.5"
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {buckets.map((bucket, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: number of columns is fixed for the component's lifetime, never reordered
        <div key={`col-${index}`} className="flex flex-col gap-2.5">
          {bucket.map((image) => (
            <NextImage
              key={image.id}
              src={cloudinaryUrl(image, 400)}
              alt=""
              width={image.width}
              height={image.height}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              placeholder={image.placeholder ? "blur" : "empty"}
              blurDataURL={image.placeholder ? solidBlur(image.placeholder) : undefined}
              className="block w-full rounded-lg"
            />
          ))}
        </div>
      ))}
    </div>
  )
}
