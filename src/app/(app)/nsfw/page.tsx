import { OctagonAlert, Shield } from "lucide-react"
import type { Metadata } from "next"
import { z } from "zod"
import { Pagination } from "@/components/gallery/pagination"
import { TagFilter } from "@/components/gallery/tag-filter"
import { Masonry } from "@/components/masonry"
import { ApiStatus } from "@/components/shell/api-status"
import { Topbar } from "@/components/shell/topbar"
import { fetchImagePage, fetchImagesByTag } from "@/services/images"
import { getTagById } from "@/services/tags"

export const metadata: Metadata = { title: "NSFW | Alcremie" }

interface PageProps {
  searchParams: Promise<{ page?: string; tag?: string }>
}

const Page = async ({ searchParams }: PageProps) => {
  const { page: rawPage, tag: rawTag } = await searchParams
  const page = Math.max(1, Number(rawPage) || 1)
  const tag = z.uuid().safeParse(rawTag).success ? rawTag : undefined

  const [result, selectedTag] = await Promise.all([
    tag ? fetchImagesByTag({ tagId: tag, nsfw: true, limit: 35 }) : fetchImagePage({ nsfw: true, page, limit: 35 }),
    tag ? getTagById(tag) : Promise.resolve(null),
  ])

  return (
    <>
      <Topbar icon={OctagonAlert} title="NSFW" right={<ApiStatus />} />
      <div className="flex flex-none items-center gap-2.5 border-b border-warn/[0.22] bg-warn/[0.08] px-6 py-2.5">
        <Shield size={16} strokeWidth={1.75} className="text-warn" />
        <span className="text-[13px] text-warn">
          Age-restricted mode. Verified for this session — expires when you sign out.
        </span>
        <div className="grow" />
        <span className="font-mono text-[11px] text-warn/80">nsfw=true</span>
      </div>
      <TagFilter selected={selectedTag} basePath="/nsfw" />
      <div className="grow px-6 py-4">
        <Masonry images={result.data} columns={5} />
      </div>
      {"totalPage" in result ? (
        <Pagination page={page} totalPage={result.totalPage} tag={tag} basePath="/nsfw" />
      ) : null}
    </>
  )
}

export default Page
