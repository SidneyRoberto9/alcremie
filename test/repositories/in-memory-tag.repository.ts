import { Tag } from '@/domain/alcremie/enterprise/entities/tag';
import { TagRepository } from '@/domain/alcremie/application/repositories/tag.repository';
import { PaginationParams } from '@/core/repositories/pagination-params';

export class InMemoryTagRepository implements TagRepository {
  public items: Tag[] = [];

  async findById(id: string): Promise<Tag | null> {
    const tag = this.items.find((tag) => tag.id.toValue() === id);

    if (!tag) {
      return null;
    }

    return tag;
  }

  async create(tag: Tag): Promise<void> {
    this.items.push(tag);
  }

  async save(tag: Tag): Promise<void> {
    const itemIndex = this.items.findIndex((item) => item.id === tag.id);
    this.items[itemIndex] = tag;
  }

  async findBySlug(slug: string): Promise<Tag | null> {
    const tag = this.items.find((tag) => tag.slug.value === slug);

    if (!tag) {
      return null;
    }

    return tag;
  }

  async findByName(name: string): Promise<Tag | null> {
    const tag = this.items.find((tag) => tag.name === name);

    if (!tag) {
      return null;
    }

    return tag;
  }

  async findMany({ page, size }: PaginationParams): Promise<Tag[]> {
    const tag = this.items.sort().slice((page - 1) * size, page * size);

    return tag;
  }

  async findManyByName(name: string, limit: number): Promise<Tag[]> {
    const tag = this.items.filter((tag) => tag.name === name).slice(0, limit);

    return tag;
  }

  async delete(tag: Tag): Promise<void> {
    const itemIndex = this.items.findIndex((item) => item.id === tag.id);
    this.items.splice(itemIndex, 1);
  }

  async count(): Promise<number> {
    return this.items.length;
  }

  async findManyByIds(ids: string[]): Promise<Tag[]> {
    const tags = this.items.filter((tag) => ids.includes(tag.id.toValue()));

    return tags;
  }
}
