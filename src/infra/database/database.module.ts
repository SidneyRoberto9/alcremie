import { Module } from '@nestjs/common';
import { PrismaUserRepository } from '@/infra/database/prisma/repository/prisma.user.repository';
import { PrismaTagRepository } from '@/infra/database/prisma/repository/prisma-tag.repository';
import { PrismaRequestRepository } from '@/infra/database/prisma/repository/prisma-request.repository';
import { PrismaImageRepository } from '@/infra/database/prisma/repository/prisma-image.repository';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { UserRepository } from '@/domain/alcremie/application/repositories/user.repository';
import { TagRepository } from '@/domain/alcremie/application/repositories/tag.repository';
import { RequestRepository } from '@/domain/alcremie/application/repositories/request.repository';
import { ImageRepository } from '@/domain/alcremie/application/repositories/image.repository';

@Module({
  providers: [
    PrismaService,
    {
      provide: ImageRepository,
      useClass: PrismaImageRepository,
    },
    {
      provide: RequestRepository,
      useClass: PrismaRequestRepository,
    },
    {
      provide: TagRepository,
      useClass: PrismaTagRepository,
    },
    {
      provide: UserRepository,
      useClass: PrismaUserRepository,
    },
  ],
  exports: [PrismaService, ImageRepository, RequestRepository, TagRepository, UserRepository],
})
export class DatabaseModule {}
