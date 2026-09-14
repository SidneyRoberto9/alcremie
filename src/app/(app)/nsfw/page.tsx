"use client"

import { Box } from "@/components/Box"
import { LoadingPage } from "@/components/LoadingPage"
import { Masonry } from "@/components/masonry"
import { Pagination } from "@/components/nsfw/Pagination"
import { SideNavFilter } from "@/components/nsfw/SideNavFilter"
import { useNSFW } from "@/contexts/useNSFW"
import type { Image } from "@/types/Image"
import type { FeedImage } from "@/types/image"

// Scaffolding, not a considered design: this page is Task 7's to rewrite behind
// the cookie/middleware gate as a Server Component reading fetchImagePage
// directly. useNSFW still returns the old REST shape (no cloudinaryId/version/
// width/height), so this reconstructs them from the one real field it does
// carry — a full Cloudinary url — just to keep the shared Masonry component's
// contract intact.
const CLOUDINARY_URL_RE = /\/upload\/v(\d+)\/(.+)\.\w+$/

const toFeedImage = (image: Image): FeedImage => {
  const match = image.url.match(CLOUDINARY_URL_RE)

  return {
    id: image.id,
    cloudinaryId: match?.[2] ?? image.assetId,
    cloudinaryVersion: match ? Number(match[1]) : 1,
    width: 500,
    height: 500,
    placeholder: null,
    rating: image.isNsfw ? "explicit" : "general",
    createdAt: image.createdAt,
  }
}

export default function Page() {
  const { images, isLoading } = useNSFW()

  if (isLoading) {
    return <LoadingPage />
  }

  return (
    <Box>
      <SideNavFilter />
      <Masonry images={images.map(toFeedImage)} />
      <Pagination />
    </Box>
  )
}
