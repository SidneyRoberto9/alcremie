import { GalleryVertical } from "lucide-react"
import type { Metadata } from "next"
import { Fragment } from "react"
import { Feed } from "@/components/recent/feed"
import { Topbar } from "@/components/shell/topbar"
import { fetchImageFeedWithTags } from "@/services/images"

export const metadata: Metadata = { title: "Recent | Alcremie" }

const Page = async () => {
  const initial = await fetchImageFeedWithTags({ nsfw: false, limit: 30 })

  return (
    <Fragment>
      <Topbar icon={GalleryVertical} title="Recent" />
      <div className="grow px-6 py-6">
        <Feed initial={initial} />
      </div>
    </Fragment>
  )
}

export default Page
