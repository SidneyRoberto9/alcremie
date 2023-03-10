export interface Tag {
  id: string;
  name: string;
  description: string;
  is_nsfw: boolean;
}

export interface TagProps {
  id?: string;
  name: string;
  description: string;
  is_nsfw: boolean;
}

export interface createTagDto {
  name: string;
  description: string;
  is_nsfw: boolean;
}

export interface TagIds {
  id: string;
}
