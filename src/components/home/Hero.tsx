"use client"

import { Eczar } from "next/font/google"
import Image from "next/image"
import { useEffect, useState } from "react"
import Masonry from "react-layout-masonry"

import { heroRandomImages } from "@/utils/hero-home-images"

const eczar = Eczar({ subsets: ["latin"], weight: ["400", "700"] })

export function Hero() {
  const [isClient, setIsClient] = useState(false)

  const breakPoints = {
    400: 2,
    700: 4,
    800: 5,
    1100: 6,
  }

  useEffect(() => {
    setIsClient(true)
  }, [])

  return (
    <div className="relative mt-16 h-[95vh] w-full overflow-hidden">
      <div className="absolute left-0 top-0 h-screen w-screen bg-rail/80" />
      <div className="absolute left-1/2 top-1/2 mt-8 -translate-x-1/2 -translate-y-1/2 transform">
        <div className="text-center text-ink">
          <div className={eczar.className}>
            <h1 className="text-5xl font-bold uppercase text-accent-soft sm:text-9xl">Alcremie</h1>
          </div>

          <div className="flex h-full w-full flex-col gap-4">
            <div className="my-4 w-full max-w-[685px] text-center text-xl sm:text-5xl">
              <p>The Api for your Anime and Waifu images</p>
            </div>
          </div>
        </div>
      </div>

      <div className="-mt-80 w-full">
        {isClient && (
          <Masonry columns={breakPoints} suppressHydrationWarning={true} suppressContentEditableWarning={true}>
            {heroRandomImages.map((item) => (
              <Image
                key={item}
                src={item}
                alt="home image"
                width={500}
                height={500}
                className="block h-full w-full object-cover"
                priority={true}
              />
            ))}
          </Masonry>
        )}
      </div>
    </div>
  )
}
