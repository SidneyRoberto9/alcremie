import { Shield } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { confirmAge } from "@/app/(redirect)/nsfw-validation/actions"

export const metadata: Metadata = { title: "Age Verification | Alcremie" }

const Page = () => (
  <div className="flex min-h-screen items-center justify-center bg-content px-4">
    <div
      data-probe="modal"
      className="flex w-[440px] max-w-full flex-col items-center gap-[18px] rounded-[14px] border border-line-2 bg-raise p-8 shadow-2xl"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-warn/[0.12] text-warn">
        <Shield size={28} strokeWidth={1.75} />
      </div>
      <h1 className="text-center font-display text-[28px] font-bold leading-[normal] text-ink">Age verification</h1>
      <p className="max-w-[272px] text-pretty text-center text-[14.5px] leading-relaxed text-ink-2">
        This section contains age-restricted content. You must be 18 or older to continue.
      </p>
      <form action={confirmAge} className="mt-1 flex w-full flex-col gap-2">
        <button
          type="submit"
          data-probe="btn-primary"
          className="flex h-11 w-full items-center justify-center rounded-lg bg-accent text-[14.5px] font-semibold text-rail"
        >
          I am 18 or older
        </button>
        <Link
          href="/"
          className="flex h-11 items-center justify-center rounded-lg border border-line-2 text-[14.5px] text-ink-2"
        >
          Take me back
        </Link>
        <label className="flex items-center gap-2 pt-1 text-[12.5px] text-ink-3">
          <span className="relative flex h-11 w-11 items-center justify-center">
            <input
              type="checkbox"
              name="remember"
              className="peer absolute inset-0 h-full w-full cursor-pointer opacity-0"
            />
            <span className="pointer-events-none h-4 w-4 rounded border border-line-2 bg-sidebar peer-checked:border-accent peer-checked:bg-accent" />
          </span>
          Remember for 30 days
        </label>
      </form>
    </div>
  </div>
)

export default Page
