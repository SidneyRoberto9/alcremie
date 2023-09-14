import { Injectable } from '@nestjs/common';
import { Tag } from '@/domain/alcremie/enterprise/entities/tag';
import { TagRepository } from '@/domain/alcremie/application/repositories/tag.repository';
import { ResourceNotFoundError } from '@/core/erros/errors/resource-not-found.error';
import { Either, right, left } from '@/core/either';

interface GetTagByIdUseCaseRequest {
  id: string;
}

type GetTagByIdUseCaseResponse = Either<ResourceNotFoundError, { tag: Tag }>;

@Injectable()
export class GetTagByIdUseCase {
  constructor(private tagRepository: TagRepository) {}

  async execute({ id }: GetTagByIdUseCaseRequest): Promise<GetTagByIdUseCaseResponse> {
    const tag = await this.tagRepository.findById(id);

    if (!tag) {
      return left(new ResourceNotFoundError());
    }

    return right({ tag });
  }
}
