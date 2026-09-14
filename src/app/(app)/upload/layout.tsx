import type { Metadata } from "next"

import type { LayoutProps } from "@/app/layout"
import { UploadContextProvider } from "@/contexts/useUpload"
export const metadata: Metadata = {
  title: "Upload | Alcremie",
  description: "The Anime Image API",
}

export default function Layout({ children }: LayoutProps) {
  return <UploadContextProvider>{children}</UploadContextProvider>
}
