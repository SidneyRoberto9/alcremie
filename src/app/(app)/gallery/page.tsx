"use client"
import { Box } from "@/components/Box"
import { Pagination } from "@/components/gallery/Pagination"
import { SideNavFilter } from "@/components/gallery/SideNavFilter"
import { LoadingPage } from "@/components/LoadingPage"
import { Masonry } from "@/components/masonry"
import { useGallery } from "@/contexts/useGallery"
import type { Image } from "@/types/Image"
import type { FeedImage } from "@/types/image"

// Scaffolding, not a considered design: this page is Task 6 (Gallery e Recent)'s
// to rewrite as a Server Component reading fetchImagePage directly. useGallery
// still returns the old REST shape (no cloudinaryId/version/width/height), so
// this reconstructs them from the one real field it does carry — a full
// Cloudinary url — just to keep the shared Masonry component's contract intact.
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
  const { images, isLoading } = useGallery()

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
