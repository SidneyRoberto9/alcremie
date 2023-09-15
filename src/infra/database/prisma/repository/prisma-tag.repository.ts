import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { PrismaTagMapper } from '@/infra/database/prisma/mappers/prisma-tag.mapper';
import { Tag } from '@/domain/alcremie/enterprise/entities/tag';
import { TagRepository } from '@/domain/alcremie/application/repositories/tag.repository';
import { PaginationParams } from '@/core/repositories/pagination-params';

@Injectable()
export class PrismaTagRepository implements TagRepository {
  constructor(private readonly prisma: PrismaService) {}

  async addManyImageRelation(tagIdList: string[], imageId: string): Promise<void> {
    await this.prisma.tag.updateMany({
      where: {
        id: {
          in: tagIdList,
        },
      },
      data: {
        imageIDs: {
          push: imageId,
        },
      },
    });
  }

  async findById(id: string): Promise<Tag | null> {
    const tag = await this.prisma.tag.findUnique({
      where: {
        id,
      },
    });

    if (!tag) {
      return null;
    }

    return PrismaTagMapper.toDomain(tag);
  }

  async findBySlug(slug: string): Promise<Tag | null> {
    const tag = await this.prisma.tag.findUnique({
      where: {
        slug,
      },
    });

    if (!tag) {
      return null;
    }

    return PrismaTagMapper.toDomain(tag);
  }

  async findByName(name: string): Promise<Tag | null> {
    const tag = await this.prisma.tag.findUnique({
      where: {
        name,
      },
    });

    if (!tag) {
      return null;
    }

    return PrismaTagMapper.toDomain(tag);
  }

  async findMany({ page, size }: PaginationParams): Promise<Tag[]> {
    const tags = await this.prisma.tag.findMany({
      take: size,
      skip: (page - 1) * size,
    });

    return tags.map((tag) => PrismaTagMapper.toDomain(tag));
  }

  async findManyByIds(ids: string[]): Promise<Tag[]> {
    const tags = await this.prisma.tag.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    return tags.map((tag) => PrismaTagMapper.toDomain(tag));
  }

  async create(tag: Tag): Promise<void> {
    const data = PrismaTagMapper.toPersistence(tag);

    await this.prisma.tag.create({
      data,
    });
  }

  async delete(tag: Tag): Promise<void> {
    await this.prisma.tag.delete({
      where: {
        id: tag.id.toValue(),
      },
    });
  }

  async save(tag: Tag): Promise<void> {
    const data = PrismaTagMapper.toUpdate(tag);

    await this.prisma.tag.update({
      where: {
        id: tag.id.toValue(),
      },
      data,
    });
  }

  async count(): Promise<number> {
    return await this.prisma.tag.count();
  }
}
