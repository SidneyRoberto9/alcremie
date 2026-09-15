import { Image as ImageIcon } from "lucide-react"
import type { Metadata } from "next"
import { Fragment } from "react"
import { z } from "zod"
import { Pagination } from "@/components/gallery/pagination"
import { TagFilter } from "@/components/gallery/tag-filter"
import { Masonry } from "@/components/masonry"
import { Topbar } from "@/components/shell/topbar"
import { fetchImagePage, fetchImagesByTag } from "@/services/images"
import { getTagById } from "@/services/tags"

export const metadata: Metadata = { title: "Gallery | Alcremie" }

interface PageProps {
  searchParams: Promise<{ page?: string; tag?: string }>
}

const Page = async ({ searchParams }: PageProps) => {
  const { page: rawPage, tag: rawTag } = await searchParams
  const page = Math.max(1, Number(rawPage) || 1)
  const tag = z.uuid().safeParse(rawTag).success ? rawTag : undefined

  const [result, selectedTag] = await Promise.all([
    tag ? fetchImagesByTag({ tagId: tag, nsfw: false, limit: 35 }) : fetchImagePage({ nsfw: false, page, limit: 35 }),
    tag ? getTagById(tag) : Promise.resolve(null),
  ])

  return (
    <Fragment>
      <Topbar icon={ImageIcon} title="Gallery" />
      <TagFilter selected={selectedTag} basePath="/gallery" />
      <div className="grow px-6 py-4">
        <Masonry images={result.data} columns={5} linked />
      </div>
      {"totalPage" in result ? (
        <Pagination page={page} totalPage={result.totalPage} tag={tag} basePath="/gallery" />
      ) : null}
    </Fragment>
  )
}

export default Page
