import { Injectable } from '@nestjs/common';
import { Image } from '@/domain/alcremie/enterprise/entities/image';
import { ImageRepository } from '@/domain/alcremie/application/repositories/image.repository';
import { Either, right } from '@/core/either';

interface FetchImagesByTagUseCaseRequest {
  tagId: string;
  page: number;
  size?: number;
}

type FetchImagesByTagUseCaseResponse = Either<null, { images: Image[] }>;

@Injectable()
export class FetchImagesByTagUseCase {
  constructor(private imageRepository: ImageRepository) {}

  async execute({
    tagId,
    page,
    size = 25,
  }: FetchImagesByTagUseCaseRequest): Promise<FetchImagesByTagUseCaseResponse> {
    const images = await this.imageRepository.findManyByTagIn(tagId, {
      page,
      size,
    });

    return right({ images });
  }
}
