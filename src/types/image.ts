import type { images } from "@/db/schema"

// Mesmas colunas de FEED_COLUMNS em src/services/images.ts — Pick em vez de
// mão, então um rename de coluna no schema quebra a build aqui, não em runtime.
export type FeedImage = Pick<
  typeof images.$inferSelect,
  "id" | "cloudinaryId" | "cloudinaryVersion" | "width" | "height" | "placeholder" | "rating" | "createdAt"
>

export type Cursor = { createdAt: Date; id: string }

export type FeedPage = { data: FeedImage[]; hasNext: boolean; cursor: string | null }

// Só usado por fetchImageFeedWithTags — o card do /recent precisa das tags,
// a galeria e a home não, e não pagam a query por causa disso.
export type FeedImageWithTags = FeedImage & { tags: string[] }

export type TaggedFeedPage = { data: FeedImageWithTags[]; hasNext: boolean; cursor: string | null }

// Usado só pela página de detalhe (/images/[id]) — precisa de bytes/format
// (tamanho do arquivo), views e isNsfw, que o feed e a galeria nunca mostram.
export type ImageDetail = FeedImageWithTags & { views: number; bytes: number; format: string; isNsfw: boolean }

// score é o índice de Jaccard (0-100) entre o conjunto de tags desta imagem e
// o da imagem de referência — ver fetchSimilarImages.
export type SimilarImage = FeedImage & { score: number }
