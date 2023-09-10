import { Request } from '@/domain/alcremie/enterprise/entities/request';
import { RequestRepository } from '@/domain/alcremie/application/repositories/request.repository';

export class InMemoryRequestRepository implements RequestRepository {
  public items: Request[] = [];

  async findById(id: string): Promise<Request | null> {
    const request = this.items.find((request) => request.id.toValue() === id);

    if (!request) {
      return null;
    }

    return request;
  }

  async create(request: Request): Promise<void> {
    this.items.push(request);
  }

  async save(request: Request): Promise<void> {
    const itemIndex = this.items.findIndex((item) => item.id === request.id);
    this.items[itemIndex] = request;
  }

  async count(): Promise<number> {
    return this.items.length;
  }
}
