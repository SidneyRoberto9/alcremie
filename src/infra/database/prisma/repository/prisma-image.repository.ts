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
    });

    if (!image) {
      return null;
    }

    return PrismaImageMapper.toDomain(image);
  }

  async findByAssetId(id: string): Promise<Image | null> {
    const image = await this.prisma.image.findUnique({
      where: {
        assetId: id,
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
        tagsIDs: {
          has: tagId,
        },
      },
    });

    return images.map((image) => PrismaImageMapper.toDomain(image));
  }

  async findMany({ page, size }: PaginationParams): Promise<Image[]> {
    const images = await this.prisma.image.findMany({
      take: size,
      skip: (page - 1) * size,
    });

    return images.map((image) => PrismaImageMapper.toDomain(image));
  }

  async getRandom(): Promise<Image | null> {
    const allImagesIDs = await this.prisma.image.findMany({
      select: { id: true },
    });

    const imageIdArray = allImagesIDs.map((element) => element.id);
    const randomIdFromArray = imageIdArray[Math.floor(Math.random() * imageIdArray.length)];

    const randomImage = await this.prisma.image.findFirst({
      where: {
        id: randomIdFromArray,
      },
    });

    if (!randomImage) {
      return null;
    }

    return PrismaImageMapper.toDomain(randomImage);
  }

  async create(image: Image): Promise<void> {
    const data = PrismaImageMapper.toPersistence(image);

    await this.prisma.image.create({
      data,
    });
  }

  async delete(image: Image): Promise<void> {
    const tagsIdInImage = image.tags.map((tag) => tag);

    const tags = await this.prisma.tag.findMany({
      where: {
        id: {
          in: tagsIdInImage,
        },
      },
    });

    await this.prisma.$transaction([
      this.prisma.image.update({
        where: {
          id: image.id.toValue(),
        },
        data: {
          tags: {
            disconnect: tagsIdInImage.map((tagId) => ({ id: tagId })),
          },
        },
      }),
      this.prisma.image.delete({
        where: {
          id: image.id.toValue(),
        },
      }),
    ]);

    for (let tag of tags) {
      await this.prisma.tag.update({
        where: {
          id: tag.id,
        },
        data: {
          imageIDs: {
            set: tag.imageIDs.filter((imageId) => imageId !== image.id.toValue()),
          },
        },
      });
    }
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
}
