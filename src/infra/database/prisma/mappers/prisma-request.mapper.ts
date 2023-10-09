import { Request as PrismaRequest, Prisma } from '@prisma/client';
import {
  RequestTypeValue,
  RequestType,
} from '@/domain/alcremie/enterprise/entities/values-objects/request-type';
import { Request } from '@/domain/alcremie/enterprise/entities/request';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';

export class PrismaRequestMapper {
  static toDomain(raw: PrismaRequest): Request {
    return Request.create(
      {
        ip: raw.ip,
        requestType: RequestType.create(raw.requestType),
        route: raw.route,
      },
      new UniqueEntityID(raw.id),
    );
  }

  static toPersistence(request: Request): Prisma.RequestUncheckedCreateInput {
    return {
      ip: request.ip,
      requestType: request.requestType.value,
      route: request.route,
      createdAt: request.createdAt,
    };
  }
}
