import { Request } from '@/domain/alcremie/enterprise/entities/request';

export abstract class RequestRepository {
  abstract findById(id: string): Promise<Request | null>;
  abstract create(request: Request): Promise<void>;
  abstract save(request: Request): Promise<void>;
  abstract count(): Promise<number>;
}
