import { Image } from '@/domain/alcremie/enterprise/entities/image';
import { PaginationParams } from '@/core/repositories/pagination-params';

export abstract class ImageRepository {
  abstract findById(id: string): Promise<Image | null>;
  abstract findByAssetId(id: string): Promise<Image | null>;
  abstract findManyRandom(size: number): Promise<Image[]>;
  abstract findMany(params: PaginationParams, nsfw: boolean): Promise<Image[]>;
  abstract getRandom(tagId: string): Promise<Image | null>;
  abstract delete(image: Image): Promise<void>;
  abstract save(image: Image): Promise<void>;
  abstract count(): Promise<number>;
  abstract countNsfw(nsfw: Boolean): Promise<number>;
  abstract countWithTagIn(tagId: string, nsfw: Boolean): Promise<number>;
  abstract create(image: Image, tagIds: string[]): Promise<void>;
  abstract findManyByTagIn(
    tagId: string,
    nsfw: Boolean,
    params: PaginationParams,
  ): Promise<Image[]>;
}
