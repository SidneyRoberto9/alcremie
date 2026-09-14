"use client"

import { useState } from "react"
import { uploadOne } from "@/app/(app)/upload/actions"
import { toastError } from "@/lib/toast/toast-error"
import { toastSuccess } from "@/lib/toast/toast-success"

export type QueueState = "queued" | "running" | "done" | "error"

export interface QueueItem {
  id: string
  file: File
  state: QueueState
  tags?: string[]
  message?: string
}

const nextId = (file: File) => `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2)}`

export const useUploadQueue = () => {
  const [items, setItems] = useState<QueueItem[]>([])
  const [sending, setSending] = useState(false)

  const add = (files: File[]) => {
    setItems((previous) => [
      ...previous,
      ...files.map((file) => ({ id: nextId(file), file, state: "queued" as const })),
    ])
  }

  const remove = (id: string) => {
    setItems((previous) => previous.filter((row) => row.id !== id))
  }

  // Serial de propósito: cada arquivo carrega o modelo ONNX no servidor e
  // paralelizar multiplicaria a memória. Um erro num arquivo não derruba os
  // outros — cada resultado é aplicado à linha correspondente, o laço segue.
  const send = async () => {
    setSending(true)
    let done = 0
    let failed = 0

    for (const item of items) {
      if (item.state === "done") {
        continue
      }

      setItems((previous) => previous.map((row) => (row.id === item.id ? { ...row, state: "running" } : row)))

      const formData = new FormData()
      formData.append("file", item.file)
      const result = await uploadOne(formData)

      if (result.ok) {
        done++
      } else {
        failed++
      }

      setItems((previous) =>
        previous.map((row) =>
          row.id === item.id
            ? result.ok
              ? { ...row, state: "done" as const, tags: result.data.tags }
              : { ...row, state: "error" as const, message: result.error }
            : row
        )
      )
    }

    setSending(false)

    if (failed > 0) {
      toastError(`${done} enviadas, ${failed} falharam`)
      return
    }

    if (done > 0) {
      toastSuccess(`${done} imagens publicadas`)
    }
  }

  return { items, add, remove, send, sending }
}
