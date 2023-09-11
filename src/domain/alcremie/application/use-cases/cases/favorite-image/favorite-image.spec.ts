import { InMemoryUserRepository } from '@/test/repositories/in-memory-user.repository';
import { InMemoryImageRepository } from '@/test/repositories/in-memory-image.repository';
import { makeUser } from '@/test/factory/make-user';
import { makeImage } from '@/test/factory/make-image';
import { FavoriteImageUseCase } from '@/domain/alcremie/application/use-cases/cases/favorite-image/favorite-image';
import { ResourceNotFoundError } from '@/core/erros/errors/resource-not-found.error';

let inMemoryUserRepository: InMemoryUserRepository;
let inMemoryImageRepository: InMemoryImageRepository;
let sut: FavoriteImageUseCase;

describe('Favorite Image', () => {
  beforeEach(() => {
    inMemoryUserRepository = new InMemoryUserRepository();
    inMemoryImageRepository = new InMemoryImageRepository();
    sut = new FavoriteImageUseCase(inMemoryUserRepository, inMemoryImageRepository);
  });

  it('should be able to favorite a image', async () => {
    const user = makeUser();
    inMemoryUserRepository.items.push(user);

    const image = makeImage();
    inMemoryImageRepository.items.push(image);

    const result = await sut.execute({
      imageId: image.id.toValue(),
      userId: user.id.toValue(),
    });

    expect(result.isRight()).toBe(true);
    expect(result.value).toEqual({
      isFavorite: expect.any(Boolean),
    });
    expect(inMemoryUserRepository.items[0].favorites).toEqual([image]);
  });

  it('should be able to favorite already favorite image', async () => {
    const user = makeUser();
    inMemoryUserRepository.items.push(user);

    const image = makeImage();
    inMemoryImageRepository.items.push(image);

    user.favorites = [image];

    const result = await sut.execute({
      imageId: image.id.toValue(),
      userId: user.id.toValue(),
    });

    expect(result.isRight()).toBe(true);
    expect(result.value).toEqual({
      isFavorite: expect.any(Boolean),
    });
    expect(inMemoryUserRepository.items[0].favorites).toHaveLength(0);
  });

  it('should not be able to favorite uncreated image', async () => {
    const user = makeUser();
    inMemoryUserRepository.items.push(user);

    const result = await sut.execute({
      imageId: 'image-id-inexistent',
      userId: user.id.toValue(),
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
    expect(inMemoryUserRepository.items[0].favorites).toHaveLength(0);
  });
});
