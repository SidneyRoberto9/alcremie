import { ConflictException } from '@nestjs/common';
import { InMemoryTagRepository } from '@/test/repositories/in-memory-tag.repository';
import { makeTag } from '@/test/factory/make-tag';
import { Slug } from '@/domain/alcremie/enterprise/entities/values-objects/slug';
import { CreateTagUseCase } from '@/domain/alcremie/application/use-cases/cases/create-tag/create-tag';

let inMemoryTagRepository: InMemoryTagRepository;
let sut: CreateTagUseCase;

describe('Create Image', () => {
  beforeEach(() => {
    inMemoryTagRepository = new InMemoryTagRepository();
    sut = new CreateTagUseCase(inMemoryTagRepository);
  });

  it('should be able to create a new tag', async () => {
    const newTag = makeTag();

    const result = await sut.execute({
      name: newTag.name,
    });

    expect(result.isRight()).toBe(true);
    expect(result.value).toEqual({
      tag: expect.objectContaining({
        name: newTag.name,
      }),
    });
  });

  it('should not be able to create a tag with same assetId', async () => {
    const newTag = makeTag({
      name: 'Same Name',
      slug: Slug.createFromText('Same Name'),
    });

    inMemoryTagRepository.items.push(newTag);

    const result = await sut.execute({
      name: newTag.name,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ConflictException);
  });
});
