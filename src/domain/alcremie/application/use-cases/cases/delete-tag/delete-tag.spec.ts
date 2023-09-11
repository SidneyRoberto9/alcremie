import { InMemoryTagRepository } from '@/test/repositories/in-memory-tag.repository';
import { makeTag } from '@/test/factory/make-tag';
import { DeleteTagUseCase } from '@/domain/alcremie/application/use-cases/cases/delete-tag/delete-tag';
import { ResourceNotFoundError } from '@/core/erros/errors/resource-not-found.error';

let inMemoryTagRepository: InMemoryTagRepository;
let sut: DeleteTagUseCase;

describe('Delete Tag', () => {
  beforeEach(() => {
    inMemoryTagRepository = new InMemoryTagRepository();
    sut = new DeleteTagUseCase(inMemoryTagRepository);
  });

  it('should be able to delete a tag', async () => {
    const newTag = makeTag();
    inMemoryTagRepository.items.push(newTag);

    const result = await sut.execute({
      tagId: newTag.id.toValue(),
    });

    expect(result.isRight()).toBe(true);
    expect(result.value).toEqual(null);
    expect(inMemoryTagRepository.items).toHaveLength(0);
  });

  it('should not be able to delete a non-exist tag', async () => {
    const result = await sut.execute({
      tagId: 'non-exist-id',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });
});
