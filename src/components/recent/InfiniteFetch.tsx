"use client"

import { useInfiniteQuery } from "react-query"
import { Loading } from "@/components/Loading"
import { Card } from "@/components/recent/Card"
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver"
import { api } from "@/lib/axios"
import type { ImageContent, ImageFetch } from "@/types/Image"

const LIMIT = 30
const PAGE = 1

async function fetchData(page: number = PAGE, limit: number = LIMIT) {
  const { data } = await api.get<ImageFetch>(`image/${page}`, {
    params: {
      limit,
    },
  })

  return data.content
}

function fetchNextPage(lastPage: ImageContent) {
  const cursor = Number(lastPage.page) + 1

  if (lastPage.hasNext) {
    return cursor
  }
}

export function InfiniteFetch() {
  const reactQueryImages = useInfiniteQuery({
    queryKey: "fetch/image",
    queryFn: ({ pageParam = 1 }) => fetchData(pageParam),
    getNextPageParam: fetchNextPage,
    select: (data) => ({
      ...data,
      pages: data.pages.map((item) => item.data),
    }),
    retry: 2,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    refetchInterval: false,
  })

  const lastProductRef = useIntersectionObserver<HTMLDivElement>(
    () => void reactQueryImages.fetchNextPage(),
    [reactQueryImages.hasNextPage]
  )

  return (
    <section className="m-auto mt-20 max-w-3xl">
      <div className="flex flex-wrap justify-center gap-4 p-2">
        {reactQueryImages.data?.pages.flat().map((item, index, items) => (
          <div key={item.id} ref={items.length - 1 === index ? lastProductRef : null}>
            <Card key={item.id} id={item.id} tag={item.tags} url={item.url} />
          </div>
        ))}
      </div>
      {reactQueryImages.isLoading && <Loading className="my-10 h-12 w-12" />}
    </section>
  )
}
