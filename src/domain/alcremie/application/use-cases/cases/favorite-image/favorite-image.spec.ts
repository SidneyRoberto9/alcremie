import { InMemoryFavoriteRepository } from '@/test/repositories/in-memory-favorite.repository';
import { makeUser } from '@/test/factory/make-user';
import { makeImage } from '@/test/factory/make-image';
import { FavoriteImageUseCase } from '@/domain/alcremie/application/use-cases/cases/favorite-image/favorite-image';
import { ResourceNotFoundError } from '@/core/erros/errors/resource-not-found.error';

let inMemoryFavoriteRepository: InMemoryFavoriteRepository;
let sut: FavoriteImageUseCase;

describe('Favorite Image', () => {
  beforeEach(() => {
    inMemoryFavoriteRepository = new InMemoryFavoriteRepository();
    sut = new FavoriteImageUseCase(inMemoryFavoriteRepository);
  });

  it('should be able to favorite a image', async () => {
    const user = makeUser();
    const image = makeImage();

    const result = await sut.execute({
      imageId: image.id.toValue(),
      userId: user.id.toValue(),
    });

    expect(result.isRight()).toBe(true);
    expect(result.value).toEqual({
      isFavorite: expect.any(Boolean),
    });
    expect(inMemoryFavoriteRepository.items[0].imageId.toValue()).toEqual(image.id.toValue());
  });

  it('should be able to favorite already favorite image', async () => {
    const user = makeUser();
    const image = makeImage();

    const result = await sut.execute({
      imageId: image.id.toValue(),
      userId: user.id.toValue(),
    });

    await sut.execute({
      imageId: image.id.toValue(),
      userId: user.id.toValue(),
    });

    expect(result.isRight()).toBe(true);
    expect(result.value).toEqual({
      isFavorite: expect.any(Boolean),
    });
    expect(inMemoryFavoriteRepository.items).toHaveLength(0);
  });
});
