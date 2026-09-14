"use client"
import Image from "next/image"
import { PhotoView } from "react-photo-view"

import { cn } from "@/lib/utils"

interface ImageViewProps {
  id: string
  url: string
  className?: string
  width?: number
  height?: number
  priority?: boolean
}

export function ImageView({ id, url, className = "", width = 1920, height = 1080, priority = false }: ImageViewProps) {
  return (
    <PhotoView key={id} src={url || ""}>
      <Image
        key={id}
        src={url}
        width={width}
        height={height}
        priority={priority}
        alt={id}
        className={cn("h-full w-full max-w-full cursor-pointer rounded-lg object-cover shadow-md", className)}
      />
    </PhotoView>
  )
}
