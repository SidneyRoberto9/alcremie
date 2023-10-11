import { Slug } from '@/domain/alcremie/enterprise/entities/values-objects/slug';
import { Image } from '@/domain/alcremie/enterprise/entities/image';
import { Optional } from '@/core/types/optional';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Entity } from '@/core/entities/entity';

export interface TagProps {
  name: string;
  slug: Slug;
  images: Image[];
}

export class Tag extends Entity<TagProps> {
  static create(props: Optional<TagProps, 'images'>, id?: UniqueEntityID): Tag {
    const tag = new Tag(
      {
        ...props,
        slug: props.slug ?? Slug.createFromText(props.name),
        images: props.images ?? [],
      },
      id,
    );

    return tag;
  }

  get name() {
    return this.props.name;
  }

  get slug() {
    return this.props.slug;
  }

  set name(value: string) {
    this.props.name = value;
  }

  get images() {
    return this.props.images;
  }

  set images(value: Image[]) {
    this.props.images = value;
  }
}
