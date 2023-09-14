import { Role } from '@/domain/alcremie/enterprise/entities/values-objects/role';
import { Image } from '@/domain/alcremie/enterprise/entities/image';
import { Optional } from '@/core/types/optional';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Entity } from '@/core/entities/entity';

export interface UserProps {
  name: string;
  email: string;
  avatarUrl?: string;
  createdAt: Date;
  favorites: string[];
  role: Role;
}

export class User extends Entity<UserProps> {
  static create(
    props: Optional<UserProps, 'avatarUrl' | 'createdAt' | 'favorites' | 'role'>,
    id?: UniqueEntityID,
  ): User {
    const user = new User(
      {
        ...props,
        avatarUrl: props.avatarUrl ?? undefined,
        createdAt: props.createdAt ?? new Date(),
        favorites: props.favorites ?? [],
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

  get favorites() {
    return this.props.favorites;
  }

  get role() {
    return this.props.role;
  }

  set favorites(favorites: string[]) {
    this.props.favorites = favorites;
  }
}
