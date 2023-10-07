import { Injectable } from '@nestjs/common';
import { Favorite } from '@/domain/alcremie/enterprise/entities/favorite';
import { FavoriteRepository } from '@/domain/alcremie/application/repositories/favorite.repository';
import { ResourceNotFoundError } from '@/core/erros/errors/resource-not-found.error';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Either, right, left } from '@/core/either';

interface FavoriteImageUseCaseRequest {
  imageId: string;
  userId: string;
}

type FavoriteImageUseCaseResponse = Either<ResourceNotFoundError, { isFavorite: boolean }>;

@Injectable()
export class FavoriteImageUseCase {
  constructor(private favoriteRepository: FavoriteRepository) {}

  async execute({
    imageId,
    userId,
  }: FavoriteImageUseCaseRequest): Promise<FavoriteImageUseCaseResponse> {
    const isImageAlreadyFavorite = await this.favoriteRepository.findByUserIdAndImageId(
      userId,
      imageId,
    );

    if (isImageAlreadyFavorite) {
      await this.favoriteRepository.delete(isImageAlreadyFavorite);
      return right({ isFavorite: false });
    }

    const favorite = Favorite.create({
      imageId: new UniqueEntityID(imageId),
      userId: new UniqueEntityID(userId),
    });

    await this.favoriteRepository.create(favorite);

    return right({ isFavorite: true });
  }
}
