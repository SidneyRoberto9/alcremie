import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { Backdrop } from "@/components/login/backdrop"
import { LoginForm } from "@/components/login/form"
import { isAuthenticated } from "@/services/auth"
import { randomImages } from "@/services/images"

export const metadata: Metadata = { title: "Sign in | Alcremie" }

// Sorteia de novo a cada carga e lê o cookie de sessão — nada aqui pode ser
// prerenderizado.
export const dynamic = "force-dynamic"

const Page = async () => {
  if (await isAuthenticated()) {
    redirect("/gallery")
  }

  // nsfw: false é o mesmo corte SFW que a /gallery usa (general e sensitive) —
  // questionable e explicit nunca chegam ao fundo do login.
  const images = await randomImages(18, false)

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-rail px-6">
      <Backdrop images={images} />
      <div className="absolute inset-0 bg-black/[0.76]" />
      <div className="relative flex w-[380px] max-w-full flex-col gap-[22px] rounded-xl border border-line bg-sidebar p-8">
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 flex-none items-center justify-center rounded-2xl bg-accent font-display text-[22px] font-bold text-rail">
              A
            </span>
            <h1 className="font-display text-[26px] font-bold tracking-[0.02em] text-ink">Alcremie</h1>
          </div>
          <p className="text-[13.5px] text-ink-2">Sign in to manage your library.</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}

export default Page
