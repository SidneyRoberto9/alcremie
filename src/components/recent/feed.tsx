"use client"

import { useInfiniteQuery } from "@tanstack/react-query"
import { useEffect, useRef } from "react"
import { Card } from "@/components/recent/card"
import type { FeedPage } from "@/types/image"

export const Feed = ({ initial }: { initial: FeedPage }) => {
  const sentinel = useRef<HTMLDivElement>(null)

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["images", "recent"],
    initialPageParam: null as string | null,
    initialData: { pages: [initial], pageParams: [null] },
    queryFn: async ({ pageParam }) => {
      const response = await fetch(`/api/images?limit=30${pageParam ? `&cursor=${pageParam}` : ""}`)
      return (await response.json()) as FeedPage
    },
    getNextPageParam: (last) => last.cursor,
  })

  useEffect(() => {
    const node = sentinel.current
    if (!node || !hasNextPage || isFetchingNextPage) {
      return
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        void fetchNextPage()
      }
    })

    observer.observe(node)

    return () => observer.disconnect()
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  return (
    <div className="mx-auto flex max-w-[620px] flex-col gap-4">
      {data.pages
        .flatMap((page) => page.data)
        .map((image) => (
          <Card key={image.id} image={image} />
        ))}
      {hasNextPage ? <div ref={sentinel} className="h-10" /> : null}
    </div>
  )
}
