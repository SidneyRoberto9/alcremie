import { Injectable } from '@nestjs/common';
import {
  RequestTypeValue,
  RequestType,
} from '@/domain/alcremie/enterprise/entities/values-objects/request-type';
import { Request } from '@/domain/alcremie/enterprise/entities/request';
import { RequestRepository } from '@/domain/alcremie/application/repositories/request.repository';
import { NotAllowedError } from '@/core/erros/errors/not-allowed.error';
import { Either, right, left } from '@/core/either';

interface RegisterRequestUseCaseRequest {
  requestType: RequestTypeValue;
  route: string;
}

type RegisterRequestUseCaseResponse = Either<NotAllowedError, { request: Request }>;

@Injectable()
export class RegisterRequestUseCase {
  constructor(private requestRepository: RequestRepository) {}

  async execute({
    requestType,
    route,
  }: RegisterRequestUseCaseRequest): Promise<RegisterRequestUseCaseResponse> {
    const requestTypes = ['POST', 'GET', 'PUT', 'DELETE'];

    if (!requestTypes.includes(requestType)) {
      return left(new NotAllowedError());
    }

    const request = Request.create({
      requestType: RequestType.create(requestType),
      route,
    });

    await this.requestRepository.create(request);

    return right({ request });
  }
}
