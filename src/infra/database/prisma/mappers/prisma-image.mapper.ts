import { Prisma, Image as PrismaImage } from '@prisma/client';
import { Tag } from '@/domain/alcremie/enterprise/entities/tag';
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
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
        tags: raw.tagsIDs,
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
      tagsIDs: image.tags,
      tags: {
        connect: image.tags.map((tag) => ({ id: tag })),
      },
      usersIDs: image.users,
      users: {
        connect: image.users.map((user) => ({ id: user })),
      },
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
      tagsIDs: image.tags,
      tags: {
        connect: image.tags.map((tag) => ({ id: tag })),
      },
      usersIDs: image.users,
      users: {
        connect: image.users.map((user) => ({ id: user })),
      },
    };
  }
}
