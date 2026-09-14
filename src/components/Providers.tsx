"use client"

import type { ReactNode } from "react"
import { PhotoProvider } from "react-photo-view"
import { QueryClient, QueryClientProvider } from "react-query"

interface ProvidersProps {
  children: ReactNode
}

const queryClient = new QueryClient()

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <PhotoProvider>{children}</PhotoProvider>
    </QueryClientProvider>
  )
}
