import { Injectable } from '@nestjs/common';
import { TagRepository } from '@/domain/alcremie/application/repositories/tag.repository';
import { ResourceNotFoundError } from '@/core/erros/errors/resource-not-found.error';
import { Either, right, left } from '@/core/either';

interface DeleteTagUseCaseRequest {
  tagId: string;
}

type DeleteTagUseCaseResponse = Either<ResourceNotFoundError, null>;

@Injectable()
export class DeleteTagUseCase {
  constructor(private tagRepository: TagRepository) {}

  async execute({ tagId }: DeleteTagUseCaseRequest): Promise<DeleteTagUseCaseResponse> {
    const tag = await this.tagRepository.findById(tagId);

    if (!tag) {
      return left(new ResourceNotFoundError());
    }

    await this.tagRepository.delete(tag);

    return right(null);
  }
}
