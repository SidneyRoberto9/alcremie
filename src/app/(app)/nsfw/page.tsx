"use client"

import { Box } from "@/components/Box"
import { CustomMasonry } from "@/components/CustomMasonry"
import { LoadingPage } from "@/components/LoadingPage"
import { Pagination } from "@/components/nsfw/Pagination"
import { SideNavFilter } from "@/components/nsfw/SideNavFilter"
import { useNSFW } from "@/contexts/useNSFW"

export default function Page() {
  const { images, isLoading } = useNSFW()

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
