"use client"
import { Box } from "@/components/Box"
import { CustomMasonry } from "@/components/CustomMasonry"
import { Pagination } from "@/components/gallery/Pagination"
import { SideNavFilter } from "@/components/gallery/SideNavFilter"
import { LoadingPage } from "@/components/LoadingPage"
import { useGallery } from "@/contexts/useGallery"

export default function Page() {
  const { images, isLoading } = useGallery()

  if (isLoading) {
    return <LoadingPage />
  }

  return (
    <Box>
      <SideNavFilter />
      <CustomMasonry data={images} />
      <Pagination />
    </Box>
  )
}
