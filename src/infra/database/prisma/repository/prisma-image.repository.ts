import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { PrismaImageMapper } from '@/infra/database/prisma/mappers/prisma-image.mapper';
import { Image } from '@/domain/alcremie/enterprise/entities/image';
import { ImageRepository } from '@/domain/alcremie/application/repositories/image.repository';
import { PaginationParams } from '@/core/repositories/pagination-params';

@Injectable()
export class PrismaImageRepository implements ImageRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Image | null> {
    const image = await this.prisma.image.findUnique({
      where: {
        id,
      },
      include: {
        tags: true,
      },
    });

    if (!image) {
      return null;
    }

    return PrismaImageMapper.toDomainWithTag(image);
  }

  async findByAssetId(id: string): Promise<Image | null> {
    const image = await this.prisma.image.findUnique({
      where: {
        assetId: id,
      },
      include: {
        tags: true,
      },
    });

    if (!image) {
      return null;
    }

    return PrismaImageMapper.toDomain(image);
  }

  async findManyByTagIn(tagId: string, { page, size }: PaginationParams): Promise<Image[]> {
    const images = await this.prisma.image.findMany({
      take: size,
      skip: (page - 1) * size,
      where: {
        tags: {
          some: {
            id: tagId,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        tags: true,
      },
    });

    return images.map((image) => PrismaImageMapper.toDomain(image));
  }

  async findMany({ page, size }: PaginationParams, nsfw: boolean): Promise<Image[]> {
    const images = await this.prisma.image.findMany({
      where: {
        isNsfw: nsfw,
      },
      take: size,
      skip: (page - 1) * size,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        tags: true,
      },
    });

    return images.map((image) => PrismaImageMapper.toDomain(image));
  }

  async getRandom(): Promise<Image | null> {
    const allImagesIDs = await this.prisma.image.findMany({
      where: {
        isNsfw: false,
      },
      select: { id: true },
    });

    const imageIdArray = allImagesIDs.map((element) => element.id);
    const randomIdFromArray = imageIdArray[Math.floor(Math.random() * imageIdArray.length)];

    const randomImage = await this.prisma.image.findFirst({
      where: {
        id: randomIdFromArray,
      },
      include: {
        tags: true,
      },
    });

    if (!randomImage) {
      return null;
    }

    return PrismaImageMapper.toDomain(randomImage);
  }

  async findManyRandom(size: number): Promise<Image[]> {
    const allImagesIDs = await this.prisma.image.findMany({
      select: { id: true },
    });

    const imageIdArray = allImagesIDs.map((element) => element.id);
    const randomIdsFromArray: string[] = [];

    for (let i = 0; i < size; i++) {
      randomIdsFromArray.push(imageIdArray[Math.floor(Math.random() * imageIdArray.length)]);
    }

    const randomImages = await this.prisma.image.findMany({
      where: {
        id: {
          in: randomIdsFromArray,
        },
      },
      include: {
        tags: true,
      },
    });

    return randomImages.map((image) => PrismaImageMapper.toDomain(image));
  }

  async delete(image: Image): Promise<void> {
    await this.prisma.image.delete({
      where: {
        id: image.id.toValue(),
      },
    });

    image.tags.forEach(async (tag) => {
      await this.prisma.tag.update({
        where: {
          id: tag.id.toValue(),
        },
        data: {
          images: {
            disconnect: {
              id: image.id.toValue(),
            },
          },
        },
      });
    });
  }

  async save(image: Image): Promise<void> {
    const data = PrismaImageMapper.toUpdate(image);

    await this.prisma.image.update({
      where: {
        id: image.id.toValue(),
      },
      data,
    });
  }

  async count(): Promise<number> {
    return await this.prisma.image.count();
  }

  async countNsfw(nsfw: boolean): Promise<number> {
    return await this.prisma.image.count({
      where: {
        isNsfw: nsfw,
      },
    });
  }

  async countWithTagIn(tagId: string): Promise<number> {
    return await this.prisma.image.count({
      where: {
        tags: {
          some: {
            id: tagId,
          },
        },
      },
    });
  }

  async create(image: Image, tagIds: string[]): Promise<void> {
    const data = PrismaImageMapper.toPersistence(image);

    await this.prisma.image.create({
      data: {
        ...data,
        tags: {
          connect: tagIds.map((tagId) => ({ id: tagId })),
        },
      },
    });
  }
}
