import { Tag } from '@/domain/alcremie/enterprise/entities/tag';
import { Optional } from '@/core/types/optional';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Entity } from '@/core/entities/entity';

export interface ImageProps {
  isNsfw: boolean;
  assetId: string;
  url: string;
  updatedAt?: Date | null;
  createdAt: Date;
  tags: Tag[];
}

export class Image extends Entity<ImageProps> {
  static create(props: Optional<ImageProps, 'createdAt' | 'tags'>, id?: UniqueEntityID): Image {
    const image = new Image(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
        tags: props.tags ?? [],
      },
      id,
    );

    return image;
  }

  get isNsfw() {
    return this.props.isNsfw;
  }

  get assetId() {
    return this.props.assetId;
  }

  get url() {
    return this.props.url;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get tags() {
    return this.props.tags;
  }

  set tags(value: Tag[]) {
    this.props.tags = value;
  }

  set isNsfw(value: boolean) {
    this.props.isNsfw = value;
  }

  set url(value: string) {
    this.props.url = value;
  }

  set assetId(value: string) {
    this.props.assetId = value;
  }
}
