"use client"

import Image from "next/image"
import Masonry from "react-layout-masonry"
import { PhotoView } from "react-photo-view"

import type { Image as IMG } from "@/types/Image"

interface MasonryProps {
  data?: IMG[]
}

export function CustomMasonry({ data = [] }: MasonryProps) {
  const Breakpoints = {
    760: 2,
    900: 3,
    1366: 4,
    1440: 5,
    1920: 6,
    2144: 7,
  }

  return (
    <div className="w-full">
      <Masonry columns={Breakpoints}>
        {data.map((item) => (
          <div key={item.id} className="cursor-pointer">
            <PhotoView src={item.url}>
              <Image
                key={item.assetId}
                src={item.url}
                alt={item.id}
                width={500}
                height={500}
                className="block h-full w-full object-cover"
                priority={true}
              />
            </PhotoView>
          </div>
        ))}
      </Masonry>
    </div>
  )
}
