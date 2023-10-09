import { InMemoryTagRepository } from '@/test/repositories/in-memory-tag.repository';
import { makeTag } from '@/test/factory/make-tag';
import { FetchTagsUseCase } from '@/domain/alcremie/application/use-cases/cases/fetch-tags/fetch-tags';

let inMemoryTagRepository: InMemoryTagRepository;
let sut: FetchTagsUseCase;

describe('Fetch Tags', () => {
  beforeEach(() => {
    inMemoryTagRepository = new InMemoryTagRepository();
    sut = new FetchTagsUseCase(inMemoryTagRepository);
  });

  it('should be able to fetch a ten tags', async () => {
    let tagName = '';

    for (let index = 0; index < 25; index++) {
      const newTag = makeTag();
      tagName = newTag.name;
      inMemoryTagRepository.items.push(newTag);
    }

    const result = await sut.execute({ q: tagName });

    expect(result.isRight()).toBe(true);
    expect(result.value?.tags).toHaveLength(10);
  });
});
