import { Injectable } from '@nestjs/common';
import { TagRepository } from '@/domain/alcremie/application/repositories/tag.repository';
import { RequestRepository } from '@/domain/alcremie/application/repositories/request.repository';
import { ImageRepository } from '@/domain/alcremie/application/repositories/image.repository';
import { Either, right } from '@/core/either';

interface GetStatisticsUseCaseRequest {}

type GetStatisticsUseCaseResponse = Either<null, { image: number; tag: number; request: number }>;

@Injectable()
export class GetStatisticsUseCase {
  constructor(
    private imageRepository: ImageRepository,
    private tagRepository: TagRepository,
    private requestRepository: RequestRepository,
  ) {}

  async execute({}: GetStatisticsUseCaseRequest): Promise<GetStatisticsUseCaseResponse> {
    const imageSize = await this.imageRepository.count();
    const tagSize = await this.tagRepository.count();
    const requestSize = await this.requestRepository.count();

    return right({ image: imageSize, tag: tagSize, request: requestSize });
  }
}
