"use client"

import { useQuery } from "@tanstack/react-query"

export interface TagResult {
  id: string
  name: string
  slug: string
  imageCount: number
}

export const useTagSearch = (term: string) =>
  useQuery({
    queryKey: ["tags", "search", term],
    queryFn: async () => {
      const response = await fetch(`/api/tags?q=${encodeURIComponent(term)}`)
      const body = (await response.json()) as { tags: TagResult[] }
      return body.tags
    },
  })
