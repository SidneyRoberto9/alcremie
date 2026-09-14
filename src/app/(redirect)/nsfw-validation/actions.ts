"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export const confirmAge = async (formData: FormData) => {
  const store = await cookies()

  store.set("age_ok", "1", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: formData.get("remember") === "on" ? 60 * 60 * 24 * 30 : undefined,
    path: "/",
  })

  redirect("/nsfw")
}
