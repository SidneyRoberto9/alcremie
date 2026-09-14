"use client"

import { QueueRow } from "@/components/upload/queue-row"
import type { QueueItem } from "@/hooks/upload/use-upload-queue"
import { formatBytes } from "@/utils/format-bytes"

interface QueueProps {
  items: QueueItem[]
  onRemove: (id: string) => void
  onSend: () => void
  sending: boolean
}

export const Queue = ({ items, onRemove, onSend, sending }: QueueProps) => {
  const totalBytes = items.reduce((sum, item) => sum + item.file.size, 0)

  return (
    <>
      <div className="flex items-center gap-2.5">
        <span className="font-mono text-[11px] tracking-[0.1em] text-ink-3">QUEUE · {items.length}</span>
        <div className="h-px grow bg-line" />
      </div>

      <div className="flex flex-col gap-2.5">
        {items.map((item) => (
          <QueueRow key={item.id} item={item} onRemove={onRemove} />
        ))}
      </div>

      <div className="flex items-center gap-3.5 rounded-[10px] border border-line bg-sidebar px-4 py-3.5">
        <div className="flex items-center gap-2">
          <div className="relative h-5 w-[34px] flex-none rounded-full bg-accent">
            <div className="absolute right-0.5 top-0.5 h-4 w-4 rounded-full bg-rail" />
          </div>
          <span className="text-[13.5px] text-ink-2">Auto-detect NSFW rating</span>
        </div>
        <div className="grow" />
        <span className="font-mono text-[11.5px] text-ink-3">{formatBytes(totalBytes)} total</span>
        <button
          type="button"
          onClick={onSend}
          disabled={sending || items.length === 0}
          className="flex h-10 items-center rounded-lg bg-accent px-[22px] text-sm font-semibold text-rail disabled:opacity-60"
        >
          Publish {items.length} image{items.length === 1 ? "" : "s"}
        </button>
      </div>
    </>
  )
}
