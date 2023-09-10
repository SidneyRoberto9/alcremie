import { faker } from '@faker-js/faker';
import { RequestType } from '@/domain/alcremie/enterprise/entities/values-objects/request-type';
import { RequestProps, Request } from '@/domain/alcremie/enterprise/entities/request';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';

export function makeRequest(override: Partial<RequestProps> = {}, id?: UniqueEntityID) {
  const newRequest = Request.create(
    {
      requestType: RequestType.create(faker.helpers.arrayElement(['POST', 'GET', 'PUT', 'DELETE'])),
      route: faker.lorem.sentence(10),

      ...override,
    },
    id,
  );

  return newRequest;
}
