import Link from "next/link"

import { Box } from "@/components/Box"
export default function page() {
  return (
    <Box>
      <div className="flex h-full items-center justify-center">
        <span className="-mt-20 inline-block h-screen align-middle" aria-hidden="true" />

        <div className="rounded-lg bg-lucide-800 px-3 py-8 text-center sm:px-8">
          <h1 className="2 text-center text-5xl text-zinc-50">Age Verification</h1>
          <div className="my-6">
            <p>This page may contain age-restricted content.</p>
            <p>You must be 18 years old or older to enter.</p>
          </div>

          <Link
            href="/nsfw"
            className="easy rounded-md bg-violet-400 px-4 py-2 text-zinc-50 shadow-md outline-none transition-all duration-200 hover:bg-violet-500"
          >
            I'm 18 years old or older
          </Link>
        </div>
      </div>
    </Box>
  )
}
