import { Slug } from '@/domain/alcremie/enterprise/entities/values-objects/slug';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Entity } from '@/core/entities/entity';

export interface TagProps {
  name: string;
  slug: Slug;
}

export class Tag extends Entity<TagProps> {
  static create(props: TagProps, id?: UniqueEntityID): Tag {
    const tag = new Tag(
      {
        ...props,
        slug: props.slug ?? Slug.createFromText(props.name),
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
}
