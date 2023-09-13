import { Prisma, Image as PrismaImage } from '@prisma/client';
import { Image } from '@/domain/alcremie/enterprise/entities/image';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';

export class PrismaImageMapper {
  static toDomain(raw: PrismaImage): Image {
    return Image.create(
      {
        assetId: raw.assetId,
        isNsfw: raw.isNsfw,
        size: raw.size,
        url: raw.url,
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
      tagsIDs: image.tags.map((tag) => tag.id.toValue()),
      tags: {
        connect: image.tags.map((tag) => ({ id: tag.id.toValue() })),
      },
    };
  }
}
