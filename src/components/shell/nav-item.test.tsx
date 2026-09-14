import { render, screen } from "@testing-library/react"
import { expect, test, vi } from "vitest"

const renderAt = async (pathname: string, href: string) => {
  vi.resetModules()
  vi.doMock("next/navigation", () => ({ usePathname: () => pathname }))

  const { NavItem } = await import("@/components/shell/nav-item")
  const { House } = await import("lucide-react")

  render(<NavItem href={href} title="x" icon={House} />)

  return screen.getByRole("link")
}

test("Home só fica ativo na raiz", async () => {
  expect(await renderAt("/gallery", "/")).not.toHaveAttribute("aria-current")
})

test("NSFW fica ativo também em /nsfw/validation", async () => {
  expect(await renderAt("/nsfw/validation", "/nsfw")).toHaveAttribute("aria-current", "page")
})

test("Gallery não fica ativo em /", async () => {
  expect(await renderAt("/", "/gallery")).not.toHaveAttribute("aria-current")
})
