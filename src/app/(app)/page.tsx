import { House, Image as ImageIcon, Server, Tag } from "lucide-react"
import type { Metadata } from "next"
import { Fragment } from "react"
import { Hero } from "@/components/home/hero"
import { RandomPanel } from "@/components/home/random-panel"
import { StatTile } from "@/components/home/stat-tile"
import { ApiStatus } from "@/components/shell/api-status"
import { Topbar } from "@/components/shell/topbar"
import { fetchImageFeed, randomImage } from "@/services/images"
import { getStatistics } from "@/services/stats"

export const metadata: Metadata = { title: "Home | Alcremie" }
export const revalidate = 60

const Page = async () => {
  const [stats, random, backdrop] = await Promise.all([
    getStatistics(),
    randomImage(false),
    fetchImageFeed({ nsfw: false, limit: 14 }),
  ])

  return (
    <Fragment>
      <Topbar icon={House} title="Home" right={<ApiStatus />} />
      <Hero images={backdrop.data} />
      <div className="flex flex-col gap-5 p-6">
        <div className="grid grid-cols-1 gap-3.5 md:grid-cols-3">
          <StatTile icon={ImageIcon} value={stats.images} label="IMAGES" />
          <StatTile icon={Tag} value={stats.tags} label="TAGS" />
          <StatTile icon={Server} value={stats.requests} label="REQUESTS" />
        </div>
        {random ? <RandomPanel image={random} /> : null}
      </div>
    </Fragment>
  )
}

export default Page
