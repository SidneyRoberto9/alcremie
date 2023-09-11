import { Injectable } from '@nestjs/common';
import { Image } from '@/domain/alcremie/enterprise/entities/image';
import { ImageRepository } from '@/domain/alcremie/application/repositories/image.repository';
import { ResourceNotFoundError } from '@/core/erros/errors/resource-not-found.error';
import { Either, right, left } from '@/core/either';

interface GetRandomImageUseCaseRequest {}

type GetRandomImageUseCaseResponse = Either<ResourceNotFoundError, { image: Image }>;

@Injectable()
export class GetRandomImageUseCase {
  constructor(private imageRepository: ImageRepository) {}

  async execute({}: GetRandomImageUseCaseRequest): Promise<GetRandomImageUseCaseResponse> {
    const image = await this.imageRepository.getRandom();

    if (!image) {
      return left(new ResourceNotFoundError());
    }

    return right({ image });
  }
}
