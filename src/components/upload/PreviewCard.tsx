"use client"

import { X } from "lucide-react"
import Image from "next/image"

import { useUpload } from "@/contexts/useUpload"

interface PreviewCardProps {
  file: File
}

export function PreviewCard({ file }: PreviewCardProps) {
  const { remove } = useUpload()

  const fileUrl = URL.createObjectURL(file)

  return (
    <div className="relative max-h-[420px] rounded-lg border-4 border-b border-lucide-600 bg-lucide-800 p-1.5">
      <Image
        src={fileUrl}
        alt={file.name}
        width={1920}
        height={1080}
        className="user-select-none h-full w-96 select-none rounded-lg object-cover"
      />
      <X size={18} onClick={() => remove(file)} className="absolute right-2 top-2 cursor-pointer text-lucide-800" />
    </div>
  )
}
