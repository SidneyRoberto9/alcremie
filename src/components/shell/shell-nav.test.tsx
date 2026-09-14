import { fireEvent, render, screen } from "@testing-library/react"
import { expect, test, vi } from "vitest"
import { ShellNav } from "@/components/shell/shell-nav"

vi.mock("next/navigation", () => ({ usePathname: () => "/" }))

test("clicar no A colapsa a sidebar e deixa só a barra", () => {
  render(<ShellNav />)

  expect(screen.getByRole("complementary")).toBeInTheDocument()

  fireEvent.click(screen.getByRole("button", { name: "Collapse sidebar" }))

  expect(screen.queryByRole("complementary")).not.toBeInTheDocument()
  expect(document.querySelector('[data-probe="rail"]')).toBeInTheDocument()

  fireEvent.click(screen.getByRole("button", { name: "Expand sidebar" }))

  expect(screen.getByRole("complementary")).toBeInTheDocument()
})
