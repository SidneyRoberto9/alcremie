import { Injectable, ConflictException } from '@nestjs/common';
import { Slug } from '@/domain/alcremie/enterprise/entities/values-objects/slug';
import { Tag } from '@/domain/alcremie/enterprise/entities/tag';
import { TagRepository } from '@/domain/alcremie/application/repositories/tag.repository';
import { Either, right, left } from '@/core/either';

interface CreateTagUseCaseRequest {
  name: string;
}

type CreateTagUseCaseResponse = Either<null, { tag: Tag }>;

@Injectable()
export class CreateTagUseCase {
  constructor(private tagRepository: TagRepository) {}

  async execute({ name }: CreateTagUseCaseRequest): Promise<CreateTagUseCaseResponse> {
    const tagWithSameSlug = await this.tagRepository.findBySlug(Slug.createFromText(name).value);

    if (tagWithSameSlug) {
      return right({ tag: tagWithSameSlug });
    }

    const tag = Tag.create({
      name,
      slug: Slug.createFromText(name),
    });

    this.tagRepository.create(tag);

    return right({ tag });
  }
}
