"use client"

import { Trash2 } from "lucide-react"
import { Fragment, useRef, useTransition } from "react"
import { deleteImage } from "@/app/(app)/images/[id]/actions"
import { toastError } from "@/lib/toast/toast-error"

interface DeleteDialogProps {
  imageId: string
}

export const DeleteDialog = ({ imageId }: DeleteDialogProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [pending, startTransition] = useTransition()

  // Em caso de sucesso a action redireciona e nada volta — só o erro chega
  // aqui, e aí o modal fecha para o toast ficar visível.
  const confirm = () =>
    startTransition(async () => {
      const result = await deleteImage(imageId)

      dialogRef.current?.close()
      toastError(result.error)
    })

  return (
    <Fragment>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        data-probe="delete-trigger"
        className="flex h-8 items-center gap-1.5 rounded-md border border-line bg-raise px-2.5 text-[13px] text-ink-2 hover:border-warn/40 hover:text-warn"
      >
        <Trash2 size={15} strokeWidth={1.75} />
        Delete
      </button>
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: fecha no clique no backdrop nativo do <dialog> — Esc já cobre o teclado */}
      <dialog
        ref={dialogRef}
        data-probe="delete-dialog"
        onClick={(event) => {
          if (event.target === dialogRef.current) {
            dialogRef.current?.close()
          }
        }}
        className="m-auto w-[400px] max-w-[calc(100vw-48px)] rounded-xl border border-line bg-sidebar p-0 text-ink backdrop:bg-black/60"
      >
        <div className="flex flex-col gap-3 p-6">
          <h2 className="text-[15px] font-semibold text-ink">Delete this image?</h2>
          <p className="text-[13.5px] leading-relaxed text-ink-2">
            It is removed from the gallery, the public API and Cloudinary. This cannot be undone.
          </p>
          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className="flex h-10 items-center rounded-lg border border-line bg-raise px-[18px] text-sm text-ink-2"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirm}
              disabled={pending}
              data-probe="delete-confirm"
              className="flex h-10 items-center rounded-lg bg-warn px-[18px] text-sm font-semibold text-rail disabled:opacity-60"
            >
              {pending ? "Deleting…" : "Delete"}
            </button>
          </div>
        </div>
      </dialog>
    </Fragment>
  )
}
