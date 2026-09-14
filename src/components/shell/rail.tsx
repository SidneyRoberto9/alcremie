"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { isActiveRoute } from "@/components/shell/nav-item"
import { RAIL_ITEMS } from "@/constant/navigation"
import { cn } from "@/lib/cn"

interface RailProps {
  isSidebarOpen: boolean
  onToggleSidebar: () => void
}

export const Rail = ({ isSidebarOpen, onToggleSidebar }: RailProps) => {
  const pathname = usePathname()

  return (
    <div data-probe="rail" className="flex w-[72px] flex-none flex-col items-center gap-2 bg-rail py-3">
      <button
        type="button"
        onClick={onToggleSidebar}
        aria-expanded={isSidebarOpen}
        aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        data-probe="rail-logo"
        className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent font-display text-[22px] font-bold text-rail"
      >
        A
      </button>
      <div className="my-1 h-0.5 w-8 rounded-sm bg-line" />
      {RAIL_ITEMS.map((item) => {
        const isActive = isActiveRoute(pathname, item.href)

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-label={item.title}
            className="relative flex w-full justify-center"
          >
            {isActive ? <span className="absolute left-0 top-2.5 h-6 w-1 rounded-r bg-accent" /> : null}
            <span
              className={cn(
                "flex h-11 w-11 items-center justify-center transition-all",
                isActive
                  ? "rounded-2xl bg-line-2 text-ink"
                  : "rounded-full bg-sidebar text-ink-2 hover:rounded-2xl hover:bg-line-2"
              )}
            >
              <item.icon size={22} strokeWidth={1.75} />
            </span>
          </Link>
        )
      })}
    </div>
  )
}
