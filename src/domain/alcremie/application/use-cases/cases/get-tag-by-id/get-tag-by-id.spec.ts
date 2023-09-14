import { InMemoryTagRepository } from '@/test/repositories/in-memory-tag.repository';
import { makeTag } from '@/test/factory/make-tag';
import { GetTagByIdUseCase } from '@/domain/alcremie/application/use-cases/cases/get-tag-by-id/get-tag-by-id';

let inMemoryTagRepository: InMemoryTagRepository;
let sut: GetTagByIdUseCase;

describe('Get Random Tag', () => {
  beforeEach(() => {
    inMemoryTagRepository = new InMemoryTagRepository();
    sut = new GetTagByIdUseCase(inMemoryTagRepository);
  });

  it('should be able to get a random tags ', async () => {
    const newTag = makeTag();
    inMemoryTagRepository.items.push(newTag);

    const result = await sut.execute({ id: newTag.id.toValue() });

    expect(result.isRight()).toBe(true);
    expect(inMemoryTagRepository.items).toHaveLength(1);
    expect(result.value).toHaveProperty('tag');
  });
});
