"use client"

import { createContext, type ReactNode, useContext, useEffect, useState } from "react"
import { useQuery } from "react-query"

import { api } from "@/lib/axios"
import type { Image, ImageFetch, ImageFilter } from "@/types/Image"

interface GalleryContextProps {
  images: Image[]
  filter: ImageFilter
  totalPage: number
  isLoading: boolean
  search: (filter: ImageFilter) => void
}

interface GalleryContextProviderProps {
  children: ReactNode
}

const initialContext: GalleryContextProps = {
  images: [],
  filter: {
    tagId: "",
    page: 1,
  },
  isLoading: false,
  totalPage: 1,
  search: () => {},
}

const GalleryContext = createContext<GalleryContextProps>(initialContext)

async function getImagesPaged({ page, tagId }: ImageFilter) {
  const { data } = await api.get<ImageFetch>(`image/${page}`, {
    params: {
      q: tagId,
      limit: 35,
    },
  })

  return data
}

export function GalleryContextProvider({ children }: GalleryContextProviderProps) {
  const [filter, setFilter] = useState<ImageFilter>(initialContext.filter)
  const [images, setImages] = useState<Image[]>(initialContext.images)
  const [totalPage, setTotalPage] = useState<number>(initialContext.totalPage)

  const {
    isLoading: isLoadingFetchImage,
    data: fetchImage,
    refetch,
  } = useQuery({
    queryKey: `fetch/image/${filter.page}/${filter.tagId}/true`,
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
    <GalleryContext.Provider
      value={{
        images,
        filter,
        totalPage,
        isLoading: isDataInLoading,
        search,
      }}
    >
      {children}
    </GalleryContext.Provider>
  )
}

export const useGallery = () => useContext(GalleryContext)
