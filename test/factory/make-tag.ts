import { faker } from '@faker-js/faker';
import { Slug } from '@/domain/alcremie/enterprise/entities/values-objects/slug';
import { TagProps, Tag } from '@/domain/alcremie/enterprise/entities/tag';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';

export function makeTag(override: Partial<TagProps> = {}, id?: UniqueEntityID) {
  const newTag = Tag.create(
    {
      name: faker.lorem.word(),
      slug: Slug.createFromText(faker.lorem.word()),
      ...override,
    },
    id,
  );

  return newTag;
}
