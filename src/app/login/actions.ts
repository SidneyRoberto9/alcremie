"use server"

import { redirect } from "next/navigation"
import { signIn } from "@/services/auth"

export const login = async (_previous: string | null, formData: FormData): Promise<string | null> => {
  const password = formData.get("password")

  if (typeof password !== "string" || password.length === 0) {
    return "Enter your password."
  }

  if (!(await signIn(password))) {
    return "Wrong password."
  }

  redirect("/gallery")
}
