import type { Metadata } from "next"
import type { LayoutProps } from "@/app/layout"
import { NSFWContextProvider } from "@/contexts/useNSFW"
export const metadata: Metadata = {
  title: "Gallery - NSFW | Alcremie",
  description: "The Anime Image API",
}

export default function Layout({ children }: LayoutProps) {
  return <NSFWContextProvider>{children}</NSFWContextProvider>
}
