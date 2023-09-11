import { User as PrismaUser, Prisma } from '@prisma/client';
import { User } from '@/domain/alcremie/enterprise/entities/user';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';

export class PrismaUserMapper {
  static toDomain(raw: PrismaUser): User {
    return User.create(
      {
        name: raw.name,
        email: raw.email,
      },
      new UniqueEntityID(raw.id),
    );
  }

  static toPersistence(user: User): Prisma.UserUncheckedCreateInput {
    return {
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
    };
  }
}
