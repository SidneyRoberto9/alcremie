"use client"

import { createContext, type ReactNode, useContext, useEffect, useState } from "react"

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

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? ""

// ponytail: fetch nativo em vez de axios/react-query (removidos nesta tarefa
// para a Galeria e o Recent) — o NSFW inteiro é reescrito na Onda 3 (Task 7),
// então isto só mantém a build verde até lá, sem mudar o comportamento.
async function getImagesPaged({ page, tagId }: ImageFilter) {
  const params = new URLSearchParams({ q: tagId, nsfw: "true", limit: "35" })
  const response = await fetch(`${API_URL}/image/${page}?${params}`)
  return (await response.json()) as ImageFetch
}

export function NSFWContextProvider({ children }: NSFWContextProviderProps) {
  const [filter, setFilter] = useState<ImageFilter>(initialContext.filter)
  const [images, setImages] = useState<Image[]>(initialContext.images)
  const [totalPage, setTotalPage] = useState<number>(initialContext.totalPage)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const search = (data: ImageFilter) => setFilter((prev) => ({ ...prev, ...data }))

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)

    getImagesPaged(filter)
      .then((fetched) => {
        if (cancelled) {
          return
        }
        setImages(fetched.content.data)
        setTotalPage(fetched.content.totalPage)
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [filter])

  return (
    <NSFWContext.Provider
      value={{
        images,
        filter,
        totalPage,
        isLoading,
        search,
      }}
    >
      {children}
    </NSFWContext.Provider>
  )
}

export const useNSFW = () => useContext(NSFWContext)
