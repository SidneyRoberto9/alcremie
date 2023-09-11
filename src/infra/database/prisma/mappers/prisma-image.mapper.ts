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
      id: image.id.toString(),
      assetId: image.assetId,
      url: image.url,
      isNsfw: image.isNsfw,
      size: image.size,
      updatedAt: image.updatedAt,
    };
  }
}
