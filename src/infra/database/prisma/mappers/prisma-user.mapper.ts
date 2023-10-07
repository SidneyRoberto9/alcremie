import { User as PrismaUser, Prisma } from '@prisma/client';
import { Role } from '@/domain/alcremie/enterprise/entities/values-objects/role';
import { User } from '@/domain/alcremie/enterprise/entities/user';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';

export class PrismaUserMapper {
  static toDomain(raw: PrismaUser): User {
    return User.create(
      {
        name: raw.name,
        email: raw.email,
        avatarUrl: raw.avatarUrl ?? '',
        role: Role.create(raw.role),
        createdAt: raw.createdAt,
      },
      new UniqueEntityID(raw.id),
    );
  }

  static toPersistence(user: User): Prisma.UserUncheckedCreateInput {
    return {
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      role: user.role.value,
      createdAt: user.createdAt,
    };
  }

  static toUpdate(user: User): Prisma.UserUncheckedUpdateInput {
    return {
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      role: user.role.value,
      createdAt: user.createdAt,
    };
  }
}
