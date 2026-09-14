import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Page Not Found | Alcremie",
  description: "The Anime Image API",
}

export function NotFoundPage() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4">
      <img src="/not-found.png" alt="not-found" className="h-24 w-24 object-cover" />
      <p className="text-3xl text-ink">Page not Found</p>
      <Link href="/" className="rounded-md px-4 py-2 text-ink shadow-md outline-none ring-1 ring-ink">
        Go Home
      </Link>
    </div>
  )
}
