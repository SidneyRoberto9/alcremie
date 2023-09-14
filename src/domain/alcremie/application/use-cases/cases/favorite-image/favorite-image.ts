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

    const favoritesImagesId = user.favorites;

    const isImageAlreadyFavorite = favoritesImagesId.find(
      (favoriteImage) => favoriteImage === image.id.toValue(),
    );

    if (isImageAlreadyFavorite) {
      user.favorites = favoritesImagesId.filter(
        (favoriteImage) => favoriteImage !== image.id.toValue(),
      );
      image.users = image.users.filter((userId) => userId !== user.id.toValue());

      await this.userRepository.removeConnectionFromFavoriteImage(userId, imageId);
    } else {
      image.users = [...image.users, user.id.toValue()];
      user.favorites = [...favoritesImagesId, image.id.toValue()];
    }

    await this.userRepository.save(user);
    await this.imageRepository.save(image);

    return right({ isFavorite: !isImageAlreadyFavorite });
  }
}
