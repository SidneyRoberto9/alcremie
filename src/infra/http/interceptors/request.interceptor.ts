import { NestInterceptor, Injectable, ExecutionContext, CallHandler } from '@nestjs/common';
import { RegisterRequestUseCase } from '@/domain/alcremie/application/use-cases/cases/register-request/register-request';

@Injectable()
export class RequestInterceptor implements NestInterceptor {
  constructor(private readonly registerRequest: RegisterRequestUseCase) {}

  async intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest();

    await this.registerRequest.execute({
      ip: request.ip,
      requestType: request.method,
      route: request.url,
    });

    return next.handle();
  }
}
