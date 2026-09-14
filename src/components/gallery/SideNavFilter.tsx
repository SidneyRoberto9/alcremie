"use client"

import { Combobox } from "@headlessui/react"
import { SlidersHorizontal, X } from "lucide-react"
import { useState } from "react"
import Drawer from "react-modern-drawer"
import { useQuery } from "react-query"
import { useGallery } from "@/contexts/useGallery"
import { api } from "@/lib/axios"
import type { Tag } from "@/types/Tag"

const compareTag = (a?: Tag, b?: Tag): boolean => a?.name.toLowerCase() === b?.name.toLowerCase()

async function getTags(text: string): Promise<Tag[]> {
  const { data } = await api.get("tag", {
    params: {
      q: text,
      limit: 30,
    },
  })

  return data.tag
}

export function SideNavFilter() {
  const { search } = useGallery()

  const [selectedTag, setSelectedTag] = useState<Tag | undefined>(undefined)
  const [query, setQuery] = useState<string>("")
  const [isOpen, setIsOpen] = useState<boolean>(false)

  const toggleDrawer = () => setIsOpen((prevState) => !prevState)

  const { data: tags } = useQuery({
    queryKey: `tags/search/${query}`,
    queryFn: () => getTags(query),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    refetchInterval: false,
  })

  const handleSearch = () => {
    let tagId = ""

    if (selectedTag !== undefined) {
      tagId = selectedTag.id
    }

    search({ page: 1, tagId: tagId })
    setIsOpen(false)
  }

  const handleClear = () => {
    search({ page: 1, tagId: "" })
    setIsOpen(false)
  }

  return (
    <>
      <button
        onClick={toggleDrawer}
        className="group peer fixed right-2 top-2 z-20 inline-flex items-center justify-center rounded-md px-2 py-1 text-line-2 hover:bg-rail focus:outline-none focus:ring-2 focus:ring-inset focus:ring-line-2"
      >
        <SlidersHorizontal size={36} />
      </button>
      <Drawer open={isOpen} onClose={toggleDrawer} direction="right" size={400}>
        <div className="relative h-full w-full bg-sidebar">
          <X onClick={toggleDrawer} size={20} className="absolute right-2 top-2 cursor-pointer" />

          <div className="pt-14" />

          <div className="flex flex-col gap-4 px-16">
            <div className="flex flex-col items-start justify-center">
              <h1 className="mb-2 text-sm font-bold text-ink">Tag</h1>
              <div className="w-full rounded-lg border border-ink shadow-xl focus-within:ring-1 focus-within:ring-ink">
                <Combobox value={selectedTag} by={compareTag} onChange={setSelectedTag}>
                  <div className="flex w-full items-center rounded-lg bg-rail px-1">
                    <Combobox.Input
                      onChange={(event) => setQuery(event.target.value)}
                      displayValue={(tag: Tag) => tag?.name || ""}
                      className="w-full rounded-lg bg-rail p-2 outline-none"
                      spellCheck="false"
                    />
                  </div>

                  <Combobox.Options className="max-h-64 overflow-y-scroll scrollbar-thin scrollbar-track-sidebar scrollbar-thumb-accent-soft">
                    {tags?.map((tag) => (
                      <Combobox.Option
                        key={tag.id}
                        value={tag}
                        className="px-3 py-2 capitalize ui-active:bg-accent ui-active:text-ink ui-not-active:bg-line-2 ui-not-active:text-ink"
                      >
                        {tag.name.replaceAll("_", " ")}
                      </Combobox.Option>
                    ))}
                  </Combobox.Options>
                </Combobox>
              </div>
            </div>

            <div className="mb-4 flex items-center justify-between">
              <button
                type="button"
                onClick={handleSearch}
                className="inline-flex justify-center rounded-md border border-transparent bg-accent px-4 py-2 text-sm text-ink duration-300 hover:bg-accent-deep"
              >
                Search
              </button>

              <button
                type="button"
                onClick={handleClear}
                className="inline-flex justify-center rounded-md border border-transparent bg-line-2 px-4 py-2 text-sm text-ink duration-300 hover:bg-line"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </Drawer>
    </>
  )
}
