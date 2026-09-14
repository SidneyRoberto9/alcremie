import type { LucideProps } from "lucide-react"
import type { FC } from "react"

interface IconProps {
  icon: FC<LucideProps>
}

export function Icon({ icon: Icon }: IconProps) {
  return <Icon size={80} />
}
