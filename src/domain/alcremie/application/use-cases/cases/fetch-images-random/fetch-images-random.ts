import { Injectable } from '@nestjs/common';
import { Image } from '@/domain/alcremie/enterprise/entities/image';
import { ImageRepository } from '@/domain/alcremie/application/repositories/image.repository';
import { Either, right } from '@/core/either';

interface FetchImagesRandomUseCaseRequest {
  size?: number;
}

type FetchImagesRandomUseCaseResponse = Either<null, { images: Image[] }>;

@Injectable()
export class FetchImagesRandomUseCase {
  constructor(private imageRepository: ImageRepository) {}

  async execute({
    size = 15,
  }: FetchImagesRandomUseCaseRequest): Promise<FetchImagesRandomUseCaseResponse> {
    const images = await this.imageRepository.findManyRandom(size);

    return right({ images });
  }
}
