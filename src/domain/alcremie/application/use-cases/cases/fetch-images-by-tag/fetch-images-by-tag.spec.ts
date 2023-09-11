import { InMemoryTagRepository } from '@/test/repositories/in-memory-tag.repository';
import { InMemoryImageRepository } from '@/test/repositories/in-memory-image.repository';
import { makeTag } from '@/test/factory/make-tag';
import { makeImage } from '@/test/factory/make-image';
import { FetchImagesByTagUseCase } from '@/domain/alcremie/application/use-cases/cases/fetch-images-by-tag/fetch-images-by-tag';

let inMemoryTagRepository: InMemoryTagRepository;
let inMemoryImageRepository: InMemoryImageRepository;
let sut: FetchImagesByTagUseCase;

describe('Fetch Images By Tag', () => {
  beforeEach(() => {
    inMemoryTagRepository = new InMemoryTagRepository();
    inMemoryImageRepository = new InMemoryImageRepository();
    sut = new FetchImagesByTagUseCase(inMemoryImageRepository);
  });

  it('should be able to fetch images with tag', async () => {
    const newTag = makeTag();
    inMemoryTagRepository.items.push(newTag);

    for (let index = 0; index < 10; index++) {
      const newImage = makeImage({
        tags: [newTag],
      });
      inMemoryImageRepository.items.push(newImage);
    }

    for (let index = 0; index < 15; index++) {
      const newImage = makeImage();
      inMemoryImageRepository.items.push(newImage);
    }

    const result = await sut.execute({
      tagId: newTag.id.toValue(),
      page: 1,
      size: 10,
    });

    expect(result.isRight()).toBe(true);
    expect(inMemoryImageRepository.items).toHaveLength(25);
    expect(result.value?.images).toHaveLength(10);
  });
});
