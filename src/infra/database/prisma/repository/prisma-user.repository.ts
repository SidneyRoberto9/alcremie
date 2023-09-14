import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { PrismaUserMapper } from '@/infra/database/prisma/mappers/prisma-user.mapper';
import { User } from '@/domain/alcremie/enterprise/entities/user';
import { UserRepository } from '@/domain/alcremie/application/repositories/user.repository';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async removeConnectionFromFavoriteImage(userId: string, imageId: string) {
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        favoriteImages: {
          disconnect: {
            id: imageId,
          },
        },
      },
    });
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      return null;
    }

    return PrismaUserMapper.toDomain(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return null;
    }

    return PrismaUserMapper.toDomain(user);
  }

  async create(user: User): Promise<void> {
    const convertedUser = PrismaUserMapper.toPersistence(user);

    await this.prisma.user.create({
      data: convertedUser,
    });
  }

  async save(user: User): Promise<void> {
    const data = PrismaUserMapper.toUpdate(user);

    await this.prisma.user.update({
      where: {
        id: user.id.toValue(),
      },
      data,
    });
  }
}
