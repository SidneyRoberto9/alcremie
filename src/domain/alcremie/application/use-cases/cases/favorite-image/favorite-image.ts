import { Injectable } from '@nestjs/common';
import { UserRepository } from '@/domain/alcremie/application/repositories/user.repository';
import { ImageRepository } from '@/domain/alcremie/application/repositories/image.repository';
import { ResourceNotFoundError } from '@/core/erros/errors/resource-not-found.error';
import { Either, right, left } from '@/core/either';

interface FavoriteImageUseCaseRequest {
  imageId: string;
  userId: string;
}

type FavoriteImageUseCaseResponse = Either<ResourceNotFoundError, { isFavorite: boolean }>;

@Injectable()
export class FavoriteImageUseCase {
  constructor(private userRepository: UserRepository, private imageRepository: ImageRepository) {}

  async execute({
    imageId,
    userId,
  }: FavoriteImageUseCaseRequest): Promise<FavoriteImageUseCaseResponse> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      return left(new ResourceNotFoundError());
    }

    const image = await this.imageRepository.findById(imageId);

    if (!image) {
      return left(new ResourceNotFoundError());
    }

    const favoritesImages = user.favorites;
    const isImageAlreadyFavorite = favoritesImages.find(
      (favoriteImage) => favoriteImage.id === image.id,
    );

    if (isImageAlreadyFavorite) {
      user.favorites = favoritesImages.filter((favoriteImage) => favoriteImage.id !== image.id);
    } else {
      user.favorites = [...favoritesImages, image];
    }

    return right({ isFavorite: !isImageAlreadyFavorite });
  }
}
