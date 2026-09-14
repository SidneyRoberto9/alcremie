"use client"
import { Upload } from "lucide-react"
import type { ChangeEvent } from "react"

import { useUpload } from "@/contexts/useUpload"

export function UploadArea() {
  const { setImages } = useUpload()

  const handleChangeFileInput = async (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()

    const { files } = e.target
    const selectedFiles = Array.from(files as FileList)

    setImages(selectedFiles)
  }

  const handleOnDropFile = async (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault()

    const lista = Array.from(e.dataTransfer.items)
    const fileList: File[] = []

    lista.forEach((a) => {
      fileList.push(a.getAsFile() as File)
    })

    setImages(fileList)
  }

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
  }

  return (
    <div className="p-4 pt-16 md:px-16 md:pt-16">
      <label
        onDragOver={handleDragOver}
        onDrop={handleOnDropFile}
        htmlFor="image"
        className="flex w-full cursor-pointer select-none flex-col items-center justify-center gap-0.5 rounded-md border-2 border-rail bg-rail py-6"
      >
        <Upload size={20} className="m-2 text-ink" />
        <span className="text-md text-ink">Drop Images here</span>
        <span className="text-xs text-ink-2">Accept only images</span>
        <input type="file" id="image" accept="image/*" className="hidden" multiple onChange={handleChangeFileInput} />
      </label>
    </div>
  )
}
