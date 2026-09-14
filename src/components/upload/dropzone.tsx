"use client"

import { Plus, Upload } from "lucide-react"
import { useCallback } from "react"
import { useDropzone } from "react-dropzone"

interface DropzoneProps {
  onFiles: (files: File[]) => void
}

export const Dropzone = ({ onFiles }: DropzoneProps) => {
  const onDrop = useCallback((accepted: File[]) => onFiles(accepted), [onFiles])

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    noClick: true,
    noKeyboard: true,
    accept: { "image/png": [], "image/jpeg": [], "image/webp": [] },
  })

  return (
    <div
      {...getRootProps()}
      className="flex flex-col items-center gap-2.5 rounded-xl border-[1.5px] border-dashed border-line-2 bg-sidebar p-9"
    >
      <input {...getInputProps()} />
      <div className="flex h-[52px] w-[52px] items-center justify-center rounded-[14px] bg-accent/10 text-accent">
        <Upload size={26} strokeWidth={1.75} />
      </div>
      <span className="text-[15.5px] font-medium text-ink">Drop images here</span>
      <span className="text-[13px] text-ink-3">PNG, JPG or WebP · up to 8 MB each · 10 per batch</span>
      <button
        type="button"
        onClick={open}
        className="mt-1.5 flex h-9 min-h-11 items-center gap-[7px] rounded-lg border border-line-2 bg-raise px-4 text-[13.5px] font-medium text-ink"
      >
        <Plus size={15} strokeWidth={1.75} />
        Choose files
      </button>
    </div>
  )
}
