import { faker } from '@faker-js/faker';
import { UserProps, User } from '@/domain/alcremie/enterprise/entities/user';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';

export function makeUser(override: Partial<UserProps> = {}, id?: UniqueEntityID) {
  const newUser = User.create(
    {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      avatarUrl: faker.internet.avatar(),
      ...override,
    },
    id,
  );

  return newUser;
}
