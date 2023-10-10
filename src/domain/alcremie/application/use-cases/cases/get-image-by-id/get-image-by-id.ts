import { Injectable } from '@nestjs/common';
import { Image } from '@/domain/alcremie/enterprise/entities/image';
import { ImageRepository } from '@/domain/alcremie/application/repositories/image.repository';
import { Either, right, left } from '@/core/either';

interface GetImageByIdUseCaseRequest {
  id: string;
}

type GetImageByIdUseCaseResponse = Either<
  null,
  {
    image: Image;
  }
>;

@Injectable()
export class GetImageByIdUseCase {
  constructor(private imageRepository: ImageRepository) {}

  async execute({ id }: GetImageByIdUseCaseRequest): Promise<GetImageByIdUseCaseResponse> {
    const image = await this.imageRepository.findById(id);

    if (image == null) {
      return left(null);
    }

    return right({ image });
  }
}
