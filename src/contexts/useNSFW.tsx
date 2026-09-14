"use client"

import { createContext, type ReactNode, useContext, useEffect, useState } from "react"
import { useQuery } from "react-query"

import { api } from "@/lib/axios"
import type { Image, ImageFetch, ImageFilter } from "@/types/Image"

interface NSFWContextProps {
  images: Image[]
  filter: ImageFilter
  totalPage: number
  isLoading: boolean
  search: (filter: ImageFilter) => void
}

interface NSFWContextProviderProps {
  children: ReactNode
}

const initialContext: NSFWContextProps = {
  images: [],
  filter: {
    tagId: "",
    page: 1,
  },
  isLoading: false,
  totalPage: 1,
  search: () => {},
}

const NSFWContext = createContext<NSFWContextProps>(initialContext)

async function getImagesPaged({ page, tagId }: ImageFilter) {
  const { data } = await api.get<ImageFetch>(`image/${page}`, {
    params: {
      q: tagId,
      nsfw: true,
      limit: 35,
    },
  })

  return data
}

export function NSFWContextProvider({ children }: NSFWContextProviderProps) {
  const [filter, setFilter] = useState<ImageFilter>(initialContext.filter)
  const [images, setImages] = useState<Image[]>(initialContext.images)
  const [totalPage, setTotalPage] = useState<number>(initialContext.totalPage)

  const {
    isLoading: isLoadingFetchImage,
    data: fetchImage,
    refetch,
  } = useQuery({
    queryKey: `fetch/image/${filter.page}/${filter.tagId}/false`,
    queryFn: () => getImagesPaged(filter),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    refetchInterval: false,
  })

  const isDataInLoading = isLoadingFetchImage || fetchImage === undefined

  const search = (data: ImageFilter) => {
    const filterData = {
      ...filter,
      ...data,
    }

    setFilter(filterData)
  }

  useEffect(() => {
    if (fetchImage) {
      const data = fetchImage.content
      setImages(data.data)
      setTotalPage(data.totalPage)
    }
  }, [fetchImage])

  useEffect(() => {
    if (filter) {
      refetch()
    }
  }, [filter, refetch])

  return (
    <NSFWContext.Provider
      value={{
        images,
        filter,
        totalPage,
        isLoading: isDataInLoading,
        search,
      }}
    >
      {children}
    </NSFWContext.Provider>
  )
}

export const useNSFW = () => useContext(NSFWContext)
