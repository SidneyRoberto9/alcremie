"use client"

import { RefreshCcw } from "lucide-react"

import { useUpload } from "@/contexts/useUpload"

export function Send() {
  const { upload, imagesToUpload, isLoading } = useUpload()

  return (
    <>
      {imagesToUpload.length > 0 && (
        <div className="my-4 flex w-full items-center justify-center">
          <button
            onClick={upload}
            className="flex h-[44px] max-h-[44px] min-h-[44px] w-32 cursor-pointer items-center justify-center gap-1 rounded-lg bg-violet-400 px-4 py-2 text-xl text-zinc-50 transition-all duration-200 ease-in-out hover:bg-violet-500 disabled:cursor-not-allowed disabled:brightness-75 disabled:hover:bg-violet-400"
            disabled={imagesToUpload.length === 0 || isLoading}
          >
            {isLoading ? <RefreshCcw size={24} className="animate-spin" /> : "Send"}
          </button>
        </div>
      )}
    </>
  )
}
