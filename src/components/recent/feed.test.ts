import { expect, test } from "vitest"
import { timeAgo } from "@/components/recent/card"
import { reviveFeedPage } from "@/components/recent/feed"

// Reproduz exatamente o que /api/images devolve depois de NextResponse.json()
// + JSON.parse do lado do cliente: createdAt como string ISO, não um Date.
// Sem reviveFeedPage, isto é o que toda página depois da primeira carrega —
// a primeira vem via props do Server Component, que preserva Date de verdade.
const wireResponse = {
  data: [
    {
      id: "img-1",
      cloudinaryId: "seed/a1",
      cloudinaryVersion: 1,
      width: 100,
      height: 100,
      placeholder: null,
      rating: "general" as const,
      createdAt: "2020-01-01T00:00:00.000Z",
      tags: ["1girl"],
    },
  ],
  hasNext: false,
  cursor: null,
}

test("reviveFeedPage revives createdAt so timeAgo does not throw", () => {
  const revived = reviveFeedPage(wireResponse)

  expect(revived.data[0].createdAt).toBeInstanceOf(Date)
  expect(() => timeAgo(revived.data[0].createdAt)).not.toThrow()
  expect(typeof timeAgo(revived.data[0].createdAt)).toBe("string")
})
