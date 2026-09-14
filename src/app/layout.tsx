import "@/styles/globals.css"
import "react-modern-drawer/dist/index.css"
import "react-photo-view/dist/react-photo-view.css"
import "react-toastify/dist/ReactToastify.css"

import type { Metadata } from "next"
import { Archivo, Eczar, JetBrains_Mono } from "next/font/google"
import type { ReactNode } from "react"
import { ToastContainer } from "react-toastify"

import { Analytics } from "@/components/Analytics"
import { Header } from "@/components/Header"
import { Providers } from "@/components/Providers"
import { SideNavbar } from "@/components/sideNav/SideNavbar"
import Favicon from "../../public/favicon.ico"

const archivo = Archivo({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-sans" })
const eczar = Eczar({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-display" })
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono" })

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
    <html lang="en" className={`${archivo.variable} ${eczar.variable} ${mono.variable} font-sans`}>
      <head>
        <Analytics />
      </head>
      <body className="bg-sidebar text-ink antialiased">
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
