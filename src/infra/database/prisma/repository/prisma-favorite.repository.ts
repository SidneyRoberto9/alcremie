import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { PrismaFavoriteMapper } from '@/infra/database/prisma/mappers/prisma-favorite.mapper';
import { Favorite } from '@/domain/alcremie/enterprise/entities/favorite';
import { FavoriteRepository } from '@/domain/alcremie/application/repositories/favorite.repository';

@Injectable()
export class PrismaFavoriteRepository implements FavoriteRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(favorite: Favorite): Promise<void> {
    const data = PrismaFavoriteMapper.toPersistence(favorite);

    await this.prisma.favorites.create({
      data,
    });
  }

  async delete(favorite: Favorite): Promise<void> {
    await this.prisma.favorites.delete({
      where: {
        id: favorite.id.toValue(),
      },
    });
  }

  async findByUserIdAndImageId(userId: string, imageId: string): Promise<Favorite | null> {
    const favorite = await this.prisma.favorites.findFirst({
      where: {
        imageId,
        userId,
      },
    });

    if (!favorite) {
      return null;
    }

    return PrismaFavoriteMapper.toDomain(favorite);
  }
}
