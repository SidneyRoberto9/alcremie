import { Image as IMG, Server, Tag } from "lucide-react"
import { Fragment } from "react"
import { Hero } from "@/components/home/Hero"
import { Icon as StatusIcon } from "@/components/home/status/Icon"
import { Image as StatusImage } from "@/components/home/status/Image"
import { Item as StatusItem } from "@/components/home/status/Item"
import { ItemList as StatusItemList } from "@/components/home/status/ItemList"
import { Root as StatusRoot } from "@/components/home/status/Root"
import { api } from "@/lib/axios"
import type { Image, StatusResponse } from "@/types/Image"
export const dynamic = "force-dynamic"

async function getData() {
  const [responseStatus, responseRandomImage] = await Promise.all([
    api.get<StatusResponse>("status"),
    api.get<Image>("random-image"),
  ])

  return {
    status: responseStatus.data.statistics,
    randomImage: responseRandomImage.data,
  }
}

export default async function Page() {
  const {
    randomImage,
    status: { image, tag, request },
  } = await getData()

  return (
    <Fragment>
      <Hero />
      <StatusRoot>
        <StatusImage data={randomImage} />
        <StatusItemList>
          <StatusItem value={tag} title={"Tags"}>
            <StatusIcon icon={Tag} />
          </StatusItem>
          <StatusItem value={image} title={"Images"}>
            <StatusIcon icon={IMG} />
          </StatusItem>
          <StatusItem value={request} title={"Requests"}>
            <StatusIcon icon={Server} />
          </StatusItem>
        </StatusItemList>
      </StatusRoot>
    </Fragment>
  )
}
