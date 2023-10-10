import { Prisma, Image as PrismaImage } from '@prisma/client';
import { Image } from '@/domain/alcremie/enterprise/entities/image';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';

export class PrismaImageMapper {
  static toDomainWithTag(raw: any): Image {
    return Image.create(
      {
        assetId: raw.assetId,
        isNsfw: raw.isNsfw,
        size: raw.size,
        url: raw.url,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
        tags: raw.tags,
      },
      new UniqueEntityID(raw.id),
    );
  }

  static toDomain(raw: PrismaImage): Image {
    return Image.create(
      {
        assetId: raw.assetId,
        isNsfw: raw.isNsfw,
        size: raw.size,
        url: raw.url,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
        tags: [],
      },
      new UniqueEntityID(raw.id),
    );
  }

  static toPersistence(image: Image): Prisma.ImageUncheckedCreateInput {
    return {
      id: image.id.toValue(),
      assetId: image.assetId,
      url: image.url,
      isNsfw: image.isNsfw,
      size: image.size,
      updatedAt: image.updatedAt,
      createdAt: image.createdAt,
    };
  }

  static toUpdate(image: Image): Prisma.ImageUncheckedCreateInput {
    return {
      assetId: image.assetId,
      url: image.url,
      isNsfw: image.isNsfw,
      size: image.size,
      updatedAt: image.updatedAt,
      createdAt: image.createdAt,
    };
  }
}
