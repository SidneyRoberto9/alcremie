import { ConflictException } from '@nestjs/common';
import { InMemoryTagRepository } from '@/test/repositories/in-memory-tag.repository';
import { InMemoryImageRepository } from '@/test/repositories/in-memory-image.repository';
import { makeTag } from '@/test/factory/make-tag';
import { makeImage } from '@/test/factory/make-image';
import { CreateImageUseCase } from '@/domain/alcremie/application/use-cases/cases/create-image/create-image';

let inMemoryImageRepository: InMemoryImageRepository;
let inMemoryTagRepository: InMemoryTagRepository;
let sut: CreateImageUseCase;

describe('Create Image', () => {
  beforeEach(() => {
    inMemoryImageRepository = new InMemoryImageRepository();
    inMemoryTagRepository = new InMemoryTagRepository();
    sut = new CreateImageUseCase(inMemoryImageRepository, inMemoryTagRepository);
  });

  it('should be able to create a new image', async () => {
    const newImage = makeImage();
    const newTag = makeTag();

    inMemoryTagRepository.items.push(newTag);

    const result = await sut.execute({
      assetId: newImage.assetId,
      isNsfw: newImage.isNsfw,
      size: newImage.size,
      url: newImage.url,
      tagIds: [newTag.id.toValue()],
    });

    expect(result.isRight()).toBe(true);
    expect(result.value).toEqual({
      image: expect.objectContaining({
        assetId: newImage.assetId,
      }),
    });
  });

  it('should not be able to create a image with same assetId', async () => {
    const newImage = makeImage({
      assetId: 'same-asset-id',
    });
    const newTag = makeTag();

    inMemoryTagRepository.items.push(newTag);
    inMemoryImageRepository.items.push(newImage);

    const result = await sut.execute({
      assetId: newImage.assetId,
      isNsfw: newImage.isNsfw,
      size: newImage.size,
      url: newImage.url,
      tagIds: [newTag.id.toValue()],
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ConflictException);
  });
});
