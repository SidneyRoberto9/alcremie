import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

interface ContainerProps {
  className?: string
  children: ReactNode
}

export function Container({ className = "", children }: ContainerProps) {
  return <article className={cn("mx-auto h-screen max-w-7xl pt-3", className)}>{children}</article>
}
