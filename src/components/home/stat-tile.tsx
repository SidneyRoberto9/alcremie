import type { LucideIcon } from "lucide-react"

interface StatTileProps {
  icon: LucideIcon
  value: number
  label: string
}

export const StatTile = ({ icon: Icon, value, label }: StatTileProps) => (
  <div className="flex items-center gap-4 rounded-xl border border-line bg-raise p-[18px]">
    <div className="flex h-11 w-11 flex-none items-center justify-center rounded-[10px] bg-accent/[0.12] text-accent">
      <Icon size={22} strokeWidth={1.75} />
    </div>
    <div className="flex flex-col">
      <span className="font-display text-[30px] font-bold leading-[1.1] text-ink">{value.toLocaleString()}</span>
      <span className="font-mono text-xs tracking-[0.1em] text-ink-3">{label}</span>
    </div>
  </div>
)
