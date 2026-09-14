"use client"

import { Search, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useTagSearch } from "@/hooks/gallery/use-tag-search"

interface TagFilterProps {
  selected: { id: string; name: string } | null
  basePath: string
}

export const TagFilter = ({ selected, basePath }: TagFilterProps) => {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const { data: results } = useTagSearch(query)

  const pick = (tagId: string) => {
    router.push(`${basePath}?tag=${tagId}`)
    setQuery("")
    setOpen(false)
  }

  const clear = () => router.push(basePath)

  return (
    <div className="flex h-14 flex-none flex-wrap items-center gap-2.5 border-b border-line px-6 py-2">
      <div className="relative">
        <Search
          size={16}
          strokeWidth={1.75}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-3"
        />
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 100)}
          placeholder="Search a tag…"
          className="h-11 w-72 rounded-lg border border-line bg-sidebar pl-9 pr-3 text-[13.5px] text-ink placeholder:text-ink-3 focus:outline-none"
        />
        {open && results && results.length > 0 ? (
          <ul className="absolute left-0 top-full z-10 mt-1 max-h-64 w-72 overflow-y-auto rounded-lg border border-line bg-sidebar py-1 shadow-xl">
            {results.map((tag) => (
              <li key={tag.id}>
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => pick(tag.id)}
                  className="flex h-11 w-full items-center px-3 text-left text-[13.5px] capitalize text-ink-2 hover:bg-raise"
                >
                  {tag.name.replaceAll("_", " ")}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      {selected ? (
        <button
          type="button"
          onClick={clear}
          data-probe="chip"
          className="flex h-11 items-center gap-1.5 rounded-lg border border-accent bg-accent/10 px-3 font-mono text-[12.5px] text-accent"
        >
          {selected.name}
          <X size={14} strokeWidth={1.75} />
        </button>
      ) : null}
    </div>
  )
}
