import { Injectable } from '@nestjs/common';
import { Image } from '@/domain/alcremie/enterprise/entities/image';
import { ImageRepository } from '@/domain/alcremie/application/repositories/image.repository';
import { Either, right } from '@/core/either';

interface FetchImagesUseCaseRequest {
  page: number;
  size?: number;
}

type FetchImagesUseCaseResponse = Either<null, { images: Image[] }>;

@Injectable()
export class FetchImagesUseCase {
  constructor(private imageRepository: ImageRepository) {}

  async execute({
    page,
    size = 25,
  }: FetchImagesUseCaseRequest): Promise<FetchImagesUseCaseResponse> {
    const images = await this.imageRepository.findMany({
      page,
      size,
    });

    return right({ images });
  }
}
