import { ConflictException } from '@nestjs/common';
import { InMemoryTagRepository } from '@/test/repositories/in-memory-tag.repository';
import { makeTag } from '@/test/factory/make-tag';
import { Slug } from '@/domain/alcremie/enterprise/entities/values-objects/slug';
import { FetchTagsUseCase } from '@/domain/alcremie/application/use-cases/cases/fetch-tags/fetch-tags';

let inMemoryTagRepository: InMemoryTagRepository;
let sut: FetchTagsUseCase;

describe('Fetch Tags', () => {
  beforeEach(() => {
    inMemoryTagRepository = new InMemoryTagRepository();
    sut = new FetchTagsUseCase(inMemoryTagRepository);
  });

  it('should be able to fetch a ten tags', async () => {
    for (let index = 0; index < 25; index++) {
      const newTag = makeTag();
      inMemoryTagRepository.items.push(newTag);
    }

    const result = await sut.execute({
      page: 1,
      size: 10,
    });

    expect(result.isRight()).toBe(true);
    expect(result.value?.tags).toHaveLength(10);
  });

  it('should be able to fetch second page', async () => {
    for (let index = 0; index < 26; index++) {
      const newTag = makeTag();
      inMemoryTagRepository.items.push(newTag);
    }

    const result = await sut.execute({
      page: 2,
    });

    expect(result.isRight()).toBe(true);
    expect(result.value?.tags).toHaveLength(1);
  });
});
