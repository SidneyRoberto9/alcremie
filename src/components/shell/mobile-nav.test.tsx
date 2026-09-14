import { fireEvent, render, screen } from "@testing-library/react"
import { expect, test, vi } from "vitest"

vi.mock("next/navigation", () => ({ usePathname: () => "/" }))

// jsdom não implementa o layout de <dialog> (showModal/close mudam `.open`,
// mas não disparam o algoritmo de foco/backdrop real do navegador) — o
// suficiente para testar a lógica que escrevemos, não o comportamento nativo.
const stubDialog = () => {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.open = true
  }
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.open = false
  }
}

test("botão abre o dialog e o botão fechar fecha", async () => {
  stubDialog()
  const { MobileNav } = await import("@/components/shell/mobile-nav")
  render(<MobileNav />)

  const trigger = screen.getByRole("button", { name: "Open navigation" })

  fireEvent.click(trigger)
  expect(document.querySelector("dialog")).toHaveProperty("open", true)

  fireEvent.click(screen.getByRole("button", { name: "Close navigation" }))
  expect(document.querySelector("dialog")).toHaveProperty("open", false)
})

test("clicar no próprio elemento dialog (backdrop) fecha", async () => {
  stubDialog()
  const { MobileNav } = await import("@/components/shell/mobile-nav")
  render(<MobileNav />)

  fireEvent.click(screen.getByRole("button", { name: "Open navigation" }))
  const dialog = document.querySelector("dialog") as HTMLDialogElement
  fireEvent.click(dialog)
  expect(dialog).toHaveProperty("open", false)
})
