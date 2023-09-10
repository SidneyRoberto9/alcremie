import { Optional } from '@/core/types/optional';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Entity } from '@/core/entities/entity';

export interface UserProps {
  name: string;
  email: string;
  avatarUrl?: string;
  createdAt: Date;
}

export class User extends Entity<UserProps> {
  static create(props: Optional<UserProps, 'avatarUrl' | 'createdAt'>, id?: UniqueEntityID): User {
    const user = new User(
      {
        ...props,
        avatarUrl: props.avatarUrl ?? undefined,
        createdAt: props.createdAt ?? new Date(),
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
}
