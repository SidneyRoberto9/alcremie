import { InMemoryImageRepository } from '@/test/repositories/in-memory-image.repository';
import { makeImage } from '@/test/factory/make-image';
import { FetchImagesUseCase } from '@/domain/alcremie/application/use-cases/cases/fetch-images/fetch-images';

let inMemoryImageRepository: InMemoryImageRepository;
let sut: FetchImagesUseCase;

describe('Fetch Images', () => {
  beforeEach(() => {
    inMemoryImageRepository = new InMemoryImageRepository();
    sut = new FetchImagesUseCase(inMemoryImageRepository);
  });

  it('should be able to fetch images ', async () => {
    for (let index = 0; index < 10; index++) {
      const newImage = makeImage();
      inMemoryImageRepository.items.push(newImage);
    }

    const result = await sut.execute({
      page: 1,
    });

    expect(result.isRight()).toBe(true);
    expect(inMemoryImageRepository.items).toHaveLength(10);
    expect(result.value?.images).toHaveLength(10);
  });
});
