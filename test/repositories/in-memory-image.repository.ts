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

  async getRandom(tagId: string): Promise<Image | null> {
    if (tagId === '') {
      return this.items[Math.floor(Math.random() * this.items.length)];
    }

    const images = this.items.filter((image) =>
      image.tags.some((tag) => tag.id.toValue() === tagId),
    );

    return images[Math.floor(Math.random() * this.items.length)];
  }

  async findManyRandom(size: number): Promise<Image[]> {
    const images: Image[] = [];

    Array.from({ length: size }, (_, i) => i + 1).forEach((i) => {
      images.push(this.items[Math.floor(Math.random() * this.items.length)]);
    });

    return images;
  }

  async save(image: Image): Promise<void> {
    const itemIndex = this.items.findIndex((item) => item.id === image.id);
    this.items[itemIndex] = image;
  }

  async findMany({ page, size }: PaginationParams, nsfw: boolean): Promise<Image[]> {
    const image = this.items
      .sort()
      .filter((item) => item.isNsfw == nsfw)
      .slice((page - 1) * size, page * size);

    return image;
  }

  async delete(image: Image): Promise<void> {
    const itemIndex = this.items.findIndex((item) => item.id === image.id);
    this.items.splice(itemIndex, 1);
  }

  async count(): Promise<number> {
    return this.items.length;
  }

  async countNsfw(nsfw: boolean): Promise<number> {
    return this.items.filter((item) => item.isNsfw == nsfw).length;
  }

  async countWithTagIn(tagId: string): Promise<number> {
    return this.items.sort().filter((image) => image.tags.some((tag) => tag.id.toValue() === tagId))
      .length;
  }
}
