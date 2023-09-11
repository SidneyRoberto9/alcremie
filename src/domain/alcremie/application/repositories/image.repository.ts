import { Image } from '@/domain/alcremie/enterprise/entities/image';
import { PaginationParams } from '@/core/repositories/pagination-params';

export abstract class ImageRepository {
  abstract findById(id: string): Promise<Image | null>;
  abstract findByAssetId(id: string): Promise<Image | null>;
  abstract findManyByTagIn(tag: string, params: PaginationParams): Promise<Image[]>;
  abstract findMany(params: PaginationParams): Promise<Image[]>;
  abstract getRandom(): Promise<Image | null>;
  abstract create(image: Image): Promise<void>;
  abstract delete(image: Image): Promise<void>;
  abstract save(image: Image): Promise<void>;
  abstract count(): Promise<number>;
}
