import { Role } from '@/domain/alcremie/enterprise/entities/values-objects/role';
import { Optional } from '@/core/types/optional';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Entity } from '@/core/entities/entity';

export interface UserProps {
  name: string;
  email: string;
  avatarUrl?: string;
  role: Role;
  createdAt: Date;
}

export class User extends Entity<UserProps> {
  static create(
    props: Optional<UserProps, 'avatarUrl' | 'createdAt' | 'role'>,
    id?: UniqueEntityID,
  ): User {
    const user = new User(
      {
        ...props,
        avatarUrl: props.avatarUrl ?? undefined,
        createdAt: props.createdAt ?? new Date(),
        role: props.role ?? Role.create('DEFAULT'),
      },
      id,
    );

    return user;
  }

  get name() {
    return this.props.name;
  }

  get email() {
    return this.props.email;
  }

  get avatarUrl() {
    return this.props.avatarUrl;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get role() {
    return this.props.role;
  }
}
