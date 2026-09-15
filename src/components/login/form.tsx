"use client"

import { Lock } from "lucide-react"
import { useActionState } from "react"
import { login } from "@/app/login/actions"

export const LoginForm = () => {
  const [error, formAction, pending] = useActionState(login, null)

  return (
    <form action={formAction} className="flex flex-col gap-[22px]">
      <div className="relative flex flex-col gap-2">
        <label htmlFor="password" className="font-mono text-[10px] tracking-[0.12em] text-ink-3">
          PASSWORD
        </label>
        <Lock size={16} strokeWidth={1.75} className="pointer-events-none absolute bottom-[14px] left-3 text-ink-3" />
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          className="h-11 rounded-lg border border-line bg-sidebar pl-9 pr-3 text-[13.5px] text-ink placeholder:text-ink-3 focus:outline-none focus:ring-1 focus:ring-accent"
        />
        {error ? (
          <span role="alert" className="text-[12.5px] text-warn">
            {error}
          </span>
        ) : null}
      </div>
      <button
        type="submit"
        disabled={pending}
        data-probe="btn-primary"
        className="flex h-11 items-center justify-center rounded-lg bg-accent text-sm font-semibold text-rail disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  )
}
