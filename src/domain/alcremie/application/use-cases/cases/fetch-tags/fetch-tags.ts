import { s } from 'vitest/dist/reporters-cb94c88b';

import { Injectable } from '@nestjs/common';
import { Tag } from '@/domain/alcremie/enterprise/entities/tag';
import { TagRepository } from '@/domain/alcremie/application/repositories/tag.repository';
import { Either, right } from '@/core/either';

interface FetchTagsUseCaseRequest {
  q: string;
  size?: number;
}

type FetchTagsUseCaseResponse = Either<null, { tags: Tag[] }>;

@Injectable()
export class FetchTagsUseCase {
  constructor(private tagRepository: TagRepository) {}

  async execute({ q, size = 30 }: FetchTagsUseCaseRequest): Promise<FetchTagsUseCaseResponse> {
    const text = q.trim().toLowerCase().replaceAll(' ', '_');
    const tags = await this.tagRepository.findManyByName(text, size);

    return right({ tags });
  }
}
