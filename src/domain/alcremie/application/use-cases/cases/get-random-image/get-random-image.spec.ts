import { InMemoryImageRepository } from '@/test/repositories/in-memory-image.repository';
import { makeImage } from '@/test/factory/make-image';
import { GetRandomImageUseCase } from '@/domain/alcremie/application/use-cases/cases/get-random-image/get-random-image';

let inMemoryImageRepository: InMemoryImageRepository;
let sut: GetRandomImageUseCase;

describe('Get Random Image', () => {
  beforeEach(() => {
    inMemoryImageRepository = new InMemoryImageRepository();
    sut = new GetRandomImageUseCase(inMemoryImageRepository);
  });

  it('should be able to get a random images ', async () => {
    for (let index = 0; index < 10; index++) {
      const newImage = makeImage();
      inMemoryImageRepository.items.push(newImage);
    }

    const result = await sut.execute({});

    expect(result.isRight()).toBe(true);
    expect(inMemoryImageRepository.items).toHaveLength(10);
    expect(result.value).toHaveProperty('image');
  });
});
