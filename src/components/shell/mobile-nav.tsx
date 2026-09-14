"use client"

import { Menu, X } from "lucide-react"
import { useRef } from "react"
import { NavItem } from "@/components/shell/nav-item"
import { NAV_ITEMS } from "@/constant/navigation"

export const MobileNav = () => {
  const dialogRef = useRef<HTMLDialogElement>(null)

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        aria-label="Open navigation"
        data-probe="mobile-nav-trigger"
        className="flex h-11 w-11 flex-none items-center justify-center rounded-md text-ink-2 hover:bg-line lg:hidden"
      >
        <Menu size={20} strokeWidth={1.75} />
      </button>
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: fecha no clique no backdrop nativo do <dialog> — Esc já cobre o teclado */}
      <dialog
        ref={dialogRef}
        data-probe="mobile-nav"
        onClick={(event) => {
          if (event.target === dialogRef.current) {
            dialogRef.current?.close()
          }
        }}
        className="fixed inset-y-0 left-0 m-0 h-full w-60 max-w-[80vw] border-0 bg-sidebar p-0 backdrop:bg-black/50"
      >
        <div className="flex h-[52px] items-center justify-between border-b border-line px-4">
          <span className="font-display text-xl font-bold tracking-[0.02em] text-ink">Alcremie</span>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            aria-label="Close navigation"
            className="flex h-11 w-11 items-center justify-center text-ink-2"
          >
            <X size={20} strokeWidth={1.75} />
          </button>
        </div>
        <nav className="flex flex-col gap-0.5 p-2 pt-4">
          {NAV_ITEMS.map((item) => (
            <NavItem key={item.href} href={item.href} title={item.title} icon={item.icon} />
          ))}
        </nav>
      </dialog>
    </>
  )
}
