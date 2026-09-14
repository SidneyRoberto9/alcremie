import { CheckCircle } from "lucide-react"

import { ImageView } from "@/components/ImageView"
import type { Image as ImageData } from "@/types/Image"

interface ImageProps {
  data: ImageData
}

export function Image({ data }: ImageProps) {
  return (
    <div className="mx-2 my-10 h-[70vh]">
      <div className="flex h-full w-full min-w-[300px] flex-col items-center transition-all duration-200 ease-in-out hover:scale-105">
        <ImageView id={data.id} url={data.url} />

        <span className="flex items-center gap-1 p-1 text-emerald-400">
          <CheckCircle size={20} />
          <p className="text-zinc-100"> The API is currently online</p>
        </span>
      </div>
    </div>
  )
}
