import { Optional } from '@/core/types/optional';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Entity } from '@/core/entities/entity';

export interface FavoriteProps {
  userId: UniqueEntityID;
  imageId: UniqueEntityID;
  createdAt: Date;
}

export class Favorite extends Entity<FavoriteProps> {
  static create(props: Optional<FavoriteProps, 'createdAt'>, id?: UniqueEntityID): Favorite {
    const favorite = new Favorite(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    );

    return favorite;
  }

  get userId() {
    return this.props.userId;
  }

  set userId(userId: UniqueEntityID) {
    this.props.userId = userId;
  }

  get imageId() {
    return this.props.imageId;
  }

  set imageId(imageId: UniqueEntityID) {
    this.props.imageId = imageId;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  set createdAt(createdAt: Date) {
    this.props.createdAt = createdAt;
  }
}
