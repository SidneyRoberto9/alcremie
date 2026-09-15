import { expect, test } from "vitest"
import cloudinaryLoader from "@/utils/cloudinary-loader"
import { cloudinaryUrl } from "@/utils/cloudinary-url"

test("id seed/* resolve para o arquivo local em public/seed", () => {
  expect(cloudinaryUrl({ cloudinaryId: "seed/a1", cloudinaryVersion: 1 })).toBe("/seed/a1.webp")
})

test("id normal monta uma URL https do Cloudinary com a versão e sem transformação", () => {
  const url = cloudinaryUrl({ cloudinaryId: "alcremie/xyz123", cloudinaryVersion: 42 })

  expect(url.startsWith("https://res.cloudinary.com/")).toBe(true)
  expect(url).toContain("/image/upload/v42/alcremie/xyz123")
  expect(url).not.toContain("w_")
})

test("nunca devolve uma URL http://", () => {
  expect(cloudinaryUrl({ cloudinaryId: "alcremie/xyz123", cloudinaryVersion: 1 }).startsWith("http://")).toBe(false)
  expect(cloudinaryUrl({ cloudinaryId: "seed/a1", cloudinaryVersion: 1 }).startsWith("http://")).toBe(false)
})

test("o loader injeta a largura pedida sem ampliar e na melhor qualidade", () => {
  const src = cloudinaryUrl({ cloudinaryId: "alcremie/xyz123", cloudinaryVersion: 42 })

  expect(cloudinaryLoader({ src, width: 1080 })).toBe(
    "https://res.cloudinary.com/drcqberx9/image/upload/w_1080,c_limit,f_auto,q_auto:best/v42/alcremie/xyz123"
  )
})

test("o loader devolve o arquivo local intacto", () => {
  expect(cloudinaryLoader({ src: "/seed/a1.webp", width: 400 })).toBe("/seed/a1.webp")
})
