import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

interface TopbarProps {
  icon: LucideIcon
  title: string
  right?: ReactNode
}

export const Topbar = ({ icon: Icon, title, right }: TopbarProps) => (
  <header data-probe="topbar" className="flex h-[52px] flex-none items-center gap-2.5 border-b border-line px-6">
    <Icon size={18} strokeWidth={1.75} className="text-ink-3" />
    <h1 className="text-[15px] font-semibold text-ink">{title}</h1>
    <div className="grow" />
    {right}
  </header>
)
