import { Injectable } from '@nestjs/common';
import { ImageRepository } from '@/domain/alcremie/application/repositories/image.repository';
import { ResourceNotFoundError } from '@/core/erros/errors/resource-not-found.error';
import { Either, right, left } from '@/core/either';

interface DeleteImageUseCaseRequest {
  imageId: string;
}

type DeleteImageUseCaseResponse = Either<ResourceNotFoundError, null>;

@Injectable()
export class DeleteImageUseCase {
  constructor(private readonly imageRepository: ImageRepository) {}

  async execute({ imageId }: DeleteImageUseCaseRequest): Promise<DeleteImageUseCaseResponse> {
    const image = await this.imageRepository.findById(imageId);

    if (!image) {
      return left(new ResourceNotFoundError());
    }

    await this.imageRepository.delete(image);

    return right(null);
  }
}
