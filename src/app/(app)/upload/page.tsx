"use client"

import { Upload } from "lucide-react"
import { ApiStatus } from "@/components/shell/api-status"
import { Topbar } from "@/components/shell/topbar"
import { Dropzone } from "@/components/upload/dropzone"
import { Queue } from "@/components/upload/queue"
import { useUploadQueue } from "@/hooks/upload/use-upload-queue"

const Page = () => {
  const { items, add, remove, send, sending } = useUploadQueue()

  return (
    <>
      <Topbar icon={Upload} title="Upload" right={<ApiStatus />} />
      <div className="grow overflow-hidden p-6">
        <div className="mx-auto flex max-w-[840px] flex-col gap-[18px]">
          <Dropzone onFiles={add} />
          {items.length > 0 ? <Queue items={items} onRemove={remove} onSend={send} sending={sending} /> : null}
        </div>
      </div>
    </>
  )
}

export default Page
