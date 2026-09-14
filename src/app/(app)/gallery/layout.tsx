import type { Metadata } from "next"
import type { LayoutProps } from "@/app/layout"
import { GalleryContextProvider } from "@/contexts/useGallery"
export const metadata: Metadata = {
  title: "Gallery | Alcremie",
  description: "The Anime Image API",
}

export default function Layout({ children }: LayoutProps) {
  return <GalleryContextProvider>{children}</GalleryContextProvider>
}
