"use client"

import type { LucideIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/cn"

interface NavItemProps {
  href: string
  title: string
  icon: LucideIcon
}

export const isActiveRoute = (pathname: string, href: string) =>
  href === "/" ? pathname === "/" : pathname.startsWith(href)

export const NavItem = ({ href, title, icon: Icon }: NavItemProps) => {
  const pathname = usePathname()
  const isActive = isActiveRoute(pathname, href)

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      data-probe={isActive ? "nav-active" : undefined}
      className={cn(
        "flex h-[34px] items-center gap-2.5 rounded-md px-2 text-sm transition-colors",
        isActive ? "bg-line-2 font-medium text-ink" : "text-ink-2 hover:bg-line"
      )}
    >
      <Icon size={18} strokeWidth={1.75} />
      {title}
    </Link>
  )
}
