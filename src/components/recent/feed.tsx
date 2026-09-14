"use client"

import { useInfiniteQuery } from "@tanstack/react-query"
import { useEffect, useRef } from "react"
import { Card } from "@/components/recent/card"
import type { FeedImageWithTags, TaggedFeedPage } from "@/types/image"

// O que /api/images devolve depois de passar por NextResponse.json(): mesma
// forma de FeedImageWithTags, exceto createdAt, que chega como string ISO —
// JSON não tem tipo Date, e JSON.parse não revive um. A primeira página
// (initial, vinda por props do Server Component) não passa por isto: RSC
// serializa Date de um jeito que o cliente já recebe como Date de verdade.
type WireFeedImage = Omit<FeedImageWithTags, "createdAt"> & { createdAt: string }
type WireTaggedFeedPage = { data: WireFeedImage[]; hasNext: boolean; cursor: string | null }

// Fronteira única de conversão: sem isto, timeAgo() (que espera um Date de
// verdade) explode em toda página depois da primeira, porque só a primeira
// nunca passa por este fetch.
export const reviveFeedPage = (raw: WireTaggedFeedPage): TaggedFeedPage => ({
  ...raw,
  data: raw.data.map((image) => ({ ...image, createdAt: new Date(image.createdAt) })),
})

export const Feed = ({ initial }: { initial: TaggedFeedPage }) => {
  const sentinel = useRef<HTMLDivElement>(null)

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["images", "recent"],
    initialPageParam: null as string | null,
    initialData: { pages: [initial], pageParams: [null] },
    queryFn: async ({ pageParam }) => {
      const response = await fetch(`/api/images?limit=30${pageParam ? `&cursor=${pageParam}` : ""}`)
      return reviveFeedPage(await response.json())
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
