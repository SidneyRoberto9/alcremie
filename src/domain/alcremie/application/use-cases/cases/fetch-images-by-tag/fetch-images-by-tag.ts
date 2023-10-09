import { Injectable } from '@nestjs/common';
import { Image } from '@/domain/alcremie/enterprise/entities/image';
import { ImageRepository } from '@/domain/alcremie/application/repositories/image.repository';
import { Either, right } from '@/core/either';

interface FetchImagesByTagUseCaseRequest {
  tagId: string;
  page: number;
  size?: number;
}

interface ResponseData {
  page: number;
  totalPage: number;
  hasNext: boolean;
  data: Image[];
}

type FetchImagesByTagUseCaseResponse = Either<null, ResponseData>;

@Injectable()
export class FetchImagesByTagUseCase {
  constructor(private imageRepository: ImageRepository) {}

  async execute({
    tagId,
    page,
    size = 25,
  }: FetchImagesByTagUseCaseRequest): Promise<FetchImagesByTagUseCaseResponse> {
    const imageSize = await this.imageRepository.countWithTagIn(tagId);
    const totalPage = Math.ceil(imageSize / size);
    const images = await this.imageRepository.findManyByTagIn(tagId, {
      page,
      size,
    });

    const data: ResponseData = {
      page,
      totalPage,
      hasNext: page < totalPage,
      data: images,
    };

    return right(data);
  }
}
