import type { images } from "@/db/schema"

// Mesmas colunas de FEED_COLUMNS em src/services/images.ts — Pick em vez de
// mão, então um rename de coluna no schema quebra a build aqui, não em runtime.
export type FeedImage = Pick<
  typeof images.$inferSelect,
  "id" | "cloudinaryId" | "cloudinaryVersion" | "width" | "height" | "placeholder" | "rating" | "createdAt"
>

export type Cursor = { createdAt: Date; id: string }

export type FeedPage = { data: FeedImage[]; hasNext: boolean; cursor: string | null }
