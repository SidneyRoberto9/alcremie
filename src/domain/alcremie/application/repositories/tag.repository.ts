import { Tag } from '@/domain/alcremie/enterprise/entities/tag';
import { PaginationParams } from '@/core/repositories/pagination-params';

export abstract class TagRepository {
  abstract findById(id: string): Promise<Tag | null>;
  abstract findBySlug(slug: string): Promise<Tag | null>;
  abstract findMany(params: PaginationParams): Promise<Tag[]>;
  abstract create(tag: Tag): Promise<void>;
  abstract delete(tag: Tag): Promise<void>;
  abstract save(tag: Tag): Promise<void>;
  abstract count(): Promise<number>;
}
