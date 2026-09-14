"use client"

import { CircleCheck, Loader, OctagonAlert, Trash2 } from "lucide-react"
import { useEffect, useMemo } from "react"
import type { QueueItem } from "@/hooks/upload/use-upload-queue"
import { formatBytes } from "@/utils/format-bytes"

interface QueueRowProps {
  item: QueueItem
  onRemove: (id: string) => void
}

const statusFor = (item: QueueItem) => {
  if (item.state === "queued") {
    return <span className="text-[12.5px] text-ink-3">queued</span>
  }

  if (item.state === "running") {
    return (
      <span className="flex items-center gap-1.5 text-[12.5px] text-accent">
        <Loader size={15} strokeWidth={1.75} className="animate-spin" />
        tagging…
      </span>
    )
  }

  if (item.state === "error") {
    return (
      <span className="flex items-center gap-1.5 text-[12.5px] text-warn">
        <OctagonAlert size={15} strokeWidth={1.75} />
        {item.message}
      </span>
    )
  }

  return (
    <span className="flex items-center gap-1.5 text-[12.5px] text-ok">
      <CircleCheck size={15} strokeWidth={1.75} />
      {item.tags?.length ?? 0} tags
    </span>
  )
}

export const QueueRow = ({ item, onRemove }: QueueRowProps) => {
  const previewUrl = useMemo(() => URL.createObjectURL(item.file), [item.file])

  useEffect(() => () => URL.revokeObjectURL(previewUrl), [previewUrl])

  return (
    <div className="flex items-start gap-3.5 rounded-[10px] border border-line bg-raise p-3.5">
      <img src={previewUrl} alt="" className="block h-[72px] w-[72px] flex-none rounded-lg object-cover" />
      <div className="min-w-0 grow">
        <div className="flex items-center gap-2.5">
          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            <span className="truncate text-sm font-medium text-ink">{item.file.name}</span>
            <span className="flex-none font-mono text-[11px] text-ink-3">{formatBytes(item.file.size)}</span>
          </div>
          <div className="flex flex-none items-center gap-2.5">
            {statusFor(item)}
            <button
              type="button"
              onClick={() => onRemove(item.id)}
              aria-label="Remove"
              className="text-ink-3 hover:text-ink"
            >
              <Trash2 size={16} strokeWidth={1.75} />
            </button>
          </div>
        </div>

        {item.state === "done" && item.tags && item.tags.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-[5px]">
            {item.tags.map((tag) => (
              <span
                key={tag}
                data-probe="chip"
                className="rounded-md border border-line bg-sidebar px-2.5 py-[5px] font-mono text-xs text-accent-soft"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        {item.state === "running" ? (
          <div className="mt-2 h-[3px] overflow-hidden rounded-full bg-sidebar">
            <div className="h-full w-3/5 animate-pulse rounded-full bg-accent" />
          </div>
        ) : null}
      </div>
    </div>
  )
}
