import { Injectable } from '@nestjs/common';
import { Image } from '@/domain/alcremie/enterprise/entities/image';
import { ImageRepository } from '@/domain/alcremie/application/repositories/image.repository';
import { Either, right } from '@/core/either';

interface FetchImagesUseCaseRequest {
  page: number;
  size?: number;
  nsfw?: boolean;
}

interface ResponseData {
  page: number;
  totalPage: number;
  hasNext: boolean;
  data: Image[];
}

type FetchImagesUseCaseResponse = Either<null, ResponseData>;

@Injectable()
export class FetchImagesUseCase {
  constructor(private imageRepository: ImageRepository) {}

  async execute({
    page,
    size = 25,
    nsfw = false,
  }: FetchImagesUseCaseRequest): Promise<FetchImagesUseCaseResponse> {
    const imageSize = await this.imageRepository.countNsfw(nsfw);
    const totalPage = Math.ceil(imageSize / size);
    const images = await this.imageRepository.findMany(
      {
        page,
        size,
      },
      nsfw,
    );

    const data: ResponseData = {
      page,
      totalPage,
      hasNext: page < totalPage,
      data: images,
    };

    return right(data);
  }
}
