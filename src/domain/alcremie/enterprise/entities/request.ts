import { RequestType } from '@/domain/alcremie/enterprise/entities/values-objects/request-type';
import { Optional } from '@/core/types/optional';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Entity } from '@/core/entities/entity';

export interface RequestProps {
  requestType: RequestType;
  route: string;
  createdAt: Date;
}

export class Request extends Entity<RequestProps> {
  static create(props: Optional<RequestProps, 'createdAt'>, id?: UniqueEntityID): Request {
    const request = new Request(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    );

    return request;
  }

  get route() {
    return this.props.route;
  }

  get requestType() {
    return this.props.requestType;
  }

  get createdAt() {
    return this.props.createdAt;
  }
}
