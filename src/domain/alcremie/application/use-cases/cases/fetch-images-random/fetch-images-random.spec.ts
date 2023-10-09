import { InMemoryImageRepository } from '@/test/repositories/in-memory-image.repository';
import { makeImage } from '@/test/factory/make-image';
import { FetchImagesRandomUseCase } from '@/domain/alcremie/application/use-cases/cases/fetch-images-random/fetch-images-random';

let inMemoryImageRepository: InMemoryImageRepository;
let sut: FetchImagesRandomUseCase;

describe('Fetch Images Random', () => {
  beforeEach(() => {
    inMemoryImageRepository = new InMemoryImageRepository();
    sut = new FetchImagesRandomUseCase(inMemoryImageRepository);
  });

  it('should be able to fetch images ', async () => {
    for (let index = 0; index < 10; index++) {
      const newImage = makeImage();
      inMemoryImageRepository.items.push(newImage);
    }

    const result = await sut.execute({});

    expect(result.isRight()).toBe(true);
    expect(inMemoryImageRepository.items).toHaveLength(10);
    expect(result.value?.images).toHaveLength(10);
  });
});
