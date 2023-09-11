import { Injectable } from '@nestjs/common';
import { Tag } from '@/domain/alcremie/enterprise/entities/tag';
import { TagRepository } from '@/domain/alcremie/application/repositories/tag.repository';
import { Either, right } from '@/core/either';

interface FetchTagsUseCaseRequest {
  page: number;
  size?: number;
}

type FetchTagsUseCaseResponse = Either<null, { tags: Tag[] }>;

@Injectable()
export class FetchTagsUseCase {
  constructor(private tagRepository: TagRepository) {}

  async execute({ page, size = 25 }: FetchTagsUseCaseRequest): Promise<FetchTagsUseCaseResponse> {
    const tags = await this.tagRepository.findMany({
      page,
      size,
    });

    return right({ tags });
  }
}
