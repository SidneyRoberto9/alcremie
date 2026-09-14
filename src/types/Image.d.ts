export interface Image {
  id: string
  assetId: string
  isNsfw: boolean
  size: number
  url: string
  createdAt: Date
  updatedAt: Date
  tags: Tag[]
}

export interface Status {
  image: number
  tag: number
  request: number
}

export interface ImageFetch {
  content: ImageContent
}

export interface ImageContent {
  page: string
  totalPage: number
  hasNext: boolean
  data: Image[]
}

export interface ImageFilter {
  tagId: string
  page: number
}

interface Tag {
  id: string
  name: string
  slug: string
}

export interface StatusResponse {
  statistics: Status
}
