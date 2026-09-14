import "@/styles/globals.css"
import "react-modern-drawer/dist/index.css"
import "react-photo-view/dist/react-photo-view.css"
import "react-toastify/dist/ReactToastify.css"

import type { Metadata } from "next"
import { Roboto } from "next/font/google"
import type { ReactNode } from "react"
import { ToastContainer } from "react-toastify"

import { Analytics } from "@/components/Analytics"
import { Header } from "@/components/Header"
import { Providers } from "@/components/Providers"
import { SideNavbar } from "@/components/sideNav/SideNavbar"
import Favicon from "../../public/favicon.ico"

const roboto = Roboto({ subsets: ["latin"], weight: ["400", "500", "700"] })

export const metadata: Metadata = {
  title: "Home | Alcremie",
  description: "The Anime Image API",
  icons: [{ rel: "icon", url: Favicon.src }],
}

export interface LayoutProps {
  children: ReactNode
}

export default function RootLayout({ children }: LayoutProps) {
  return (
    <html lang="en" className={roboto.className}>
      <head>
        <Analytics />
      </head>
      <body className="bg-lucide-600 text-zinc-100 antialiased">
        <Providers>
          <Header />
          <SideNavbar />
          {children}
          <ToastContainer />
        </Providers>
      </body>
    </html>
  )
}
