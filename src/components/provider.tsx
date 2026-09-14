"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import type { ReactNode } from "react"
import { PhotoProvider } from "react-photo-view"

export const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false, staleTime: 60_000 } },
})

export const Provider = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <PhotoProvider>{children}</PhotoProvider>
  </QueryClientProvider>
)
