import { faker } from '@faker-js/faker';
import { ImageProps, Image } from '@/domain/alcremie/enterprise/entities/image';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';

export function makeImage(override: Partial<ImageProps> = {}, id?: UniqueEntityID) {
  const newImage = Image.create(
    {
      assetId: faker.string.nanoid(),
      url: faker.image.url(),
      isNsfw: faker.datatype.boolean(),
      ...override,
    },
    id,
  );

  return newImage;
}
