import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { PrismaRequestMapper } from '@/infra/database/prisma/mappers/prisma-request.mapper';
import { Request } from '@/domain/alcremie/enterprise/entities/request';
import { RequestRepository } from '@/domain/alcremie/application/repositories/request.repository';

@Injectable()
export class PrismaRequestRepository implements RequestRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Request | null> {
    const request = await this.prisma.request.findUnique({
      where: {
        id,
      },
    });

    if (!request) {
      return null;
    }

    return PrismaRequestMapper.toDomain(request);
  }

  async create(request: Request): Promise<void> {
    const data = PrismaRequestMapper.toPersistence(request);

    await this.prisma.request.create({
      data,
    });
  }

  async save(request: Request): Promise<void> {
    const data = PrismaRequestMapper.toPersistence(request);

    await this.prisma.request.update({
      where: {
        id: request.id.toValue(),
      },
      data,
    });
  }

  async count(): Promise<number> {
    return await this.prisma.request.count();
  }
}
