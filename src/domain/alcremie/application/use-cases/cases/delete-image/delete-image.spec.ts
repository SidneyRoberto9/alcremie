import { InMemoryImageRepository } from '@/test/repositories/in-memory-image.repository';
import { makeImage } from '@/test/factory/make-image';
import { DeleteImageUseCase } from '@/domain/alcremie/application/use-cases/cases/delete-image/delete-image';
import { ResourceNotFoundError } from '@/core/erros/errors/resource-not-found.error';

let inMemoryImageRepository: InMemoryImageRepository;
let sut: DeleteImageUseCase;

describe('Delete Image', () => {
  beforeEach(() => {
    inMemoryImageRepository = new InMemoryImageRepository();
    sut = new DeleteImageUseCase(inMemoryImageRepository);
  });

  it('should be able to delete a image', async () => {
    const newImage = makeImage();
    inMemoryImageRepository.items.push(newImage);

    const result = await sut.execute({
      imageId: newImage.id.toValue(),
    });

    expect(result.isRight()).toBe(true);
    expect(result.value).toEqual(null);
    expect(inMemoryImageRepository.items).toHaveLength(0);
  });

  it('should not be able to delete a non-exist image', async () => {
    const result = await sut.execute({
      imageId: 'non-exist-id',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });
});
