import type { ReactNode } from "react"

import { Container } from "@/components/Container"

interface RootProps {
  children: ReactNode
}

export function Root({ children }: RootProps) {
  return (
    <Container className="px-4 pt-1 md:pt-20 lg:px-14 lg:pt-32">
      <div className="flex flex-col items-center justify-between lg:flex-row">{children}</div>
    </Container>
  )
}
