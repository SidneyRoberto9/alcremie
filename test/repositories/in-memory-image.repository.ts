import { Image } from '@/domain/alcremie/enterprise/entities/image';
import { ImageRepository } from '@/domain/alcremie/application/repositories/image.repository';
import { PaginationParams } from '@/core/repositories/pagination-params';

export class InMemoryImageRepository implements ImageRepository {
  public items: Image[] = [];

  async findManyByTagIn(tagId: string, { page, size }: PaginationParams): Promise<Image[]> {
    const images = this.items
      .sort()
      .filter((image) => image.tags.some((tag) => tag.id.toValue() === tagId))
      .slice((page - 1) * size, page * size);

    return images;
  }

  async findByAssetId(id: string): Promise<Image | null> {
    const image = this.items.find((image) => image.assetId === id);

    if (!image) {
      return null;
    }

    return image;
  }

  async findById(id: string): Promise<Image | null> {
    const image = this.items.find((image) => image.id.toValue() === id);

    if (!image) {
      return null;
    }

    return image;
  }

  async create(image: Image): Promise<void> {
    this.items.push(image);
  }

  async getRandom(): Promise<Image | null> {
    return this.items[Math.floor(Math.random() * this.items.length)];
  }

  async save(image: Image): Promise<void> {
    const itemIndex = this.items.findIndex((item) => item.id === image.id);
    this.items[itemIndex] = image;
  }

  async findMany({ page, size }: PaginationParams): Promise<Image[]> {
    const image = this.items.sort().slice((page - 1) * size, page * size);

    return image;
  }

  async delete(image: Image): Promise<void> {
    const itemIndex = this.items.findIndex((item) => item.id === image.id);
    this.items.splice(itemIndex, 1);
  }

  async count(): Promise<number> {
    return this.items.length;
  }
}
