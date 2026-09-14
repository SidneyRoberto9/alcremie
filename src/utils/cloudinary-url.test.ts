import { expect, test } from "vitest"
import { cloudinaryUrl } from "@/utils/cloudinary-url"

test("id seed/* resolve para o arquivo local em public/seed", () => {
  expect(cloudinaryUrl({ cloudinaryId: "seed/a1", cloudinaryVersion: 1 }, 400)).toBe("/seed/a1.webp")
})

test("id normal monta uma URL https do Cloudinary com a transformação de largura e a versão", () => {
  const url = cloudinaryUrl({ cloudinaryId: "alcremie/xyz123", cloudinaryVersion: 42 }, 400)

  expect(url.startsWith("https://res.cloudinary.com/")).toBe(true)
  expect(url).toContain("w_400,f_auto,q_auto")
  expect(url).toContain("/v42/alcremie/xyz123")
})

test("nunca devolve uma URL http://", () => {
  expect(cloudinaryUrl({ cloudinaryId: "alcremie/xyz123", cloudinaryVersion: 1 }, 200).startsWith("http://")).toBe(
    false
  )
  expect(cloudinaryUrl({ cloudinaryId: "seed/a1", cloudinaryVersion: 1 }, 200).startsWith("http://")).toBe(false)
})
