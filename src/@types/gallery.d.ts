export interface GalleryFetchDataResponse {
  totalContent: number;
  pageSize: number;
  content: ImageDto[] | null;
}

export interface ImageData {
  id: string;
  isNsfw: boolean;
  source: string;
  imgurId: string;
  imgurDeleteHash: string;
  imgurUrl: string;
  tags: string[];
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface GetGalleryDataParams {
  all: boolean;
  included_tags: string;
  is_nsfw: boolean;
}
