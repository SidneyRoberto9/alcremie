import type { ReactNode } from "react"

import { cn } from "@/lib/cn"

interface ContainerProps {
  className?: string
  children: ReactNode
}

export function Box({ className = "", children }: ContainerProps) {
  return <article className={cn("relative mt-16", className)}>{children}</article>
}
