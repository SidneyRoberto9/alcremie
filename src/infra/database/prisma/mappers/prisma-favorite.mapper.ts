import { Prisma, Favorites as PrismaFavoritos } from '@prisma/client';
import { Favorite } from '@/domain/alcremie/enterprise/entities/favorite';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';

export class PrismaFavoriteMapper {
  static toDomain(raw: PrismaFavoritos): Favorite {
    return Favorite.create(
      {
        imageId: new UniqueEntityID(raw.imageId),
        userId: new UniqueEntityID(raw.userId),
      },
      new UniqueEntityID(raw.id),
    );
  }

  static toPersistence(favorite: Favorite): Prisma.FavoritesUncheckedCreateInput {
    return {
      imageId: favorite.imageId.toValue(),
      userId: favorite.userId.toValue(),
    };
  }
}
