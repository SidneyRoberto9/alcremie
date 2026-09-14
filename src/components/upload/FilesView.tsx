"use client"

import { PreviewCard } from "@/components/upload/PreviewCard"
import { useUpload } from "@/contexts/useUpload"

export function FilesView() {
  const { imagesToUpload } = useUpload()

  return (
    <div className="py-4 md:px-16">
      <div className="rounded-md">
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {imagesToUpload.map((file, _index) => (
            <PreviewCard key={file.name} file={file} />
          ))}
        </div>
      </div>
    </div>
  )
}
