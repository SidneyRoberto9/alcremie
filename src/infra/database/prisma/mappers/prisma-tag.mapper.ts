import { Tag as PrismaTag, Prisma } from '@prisma/client';
import { Slug } from '@/domain/alcremie/enterprise/entities/values-objects/slug';
import { Tag } from '@/domain/alcremie/enterprise/entities/tag';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';

export class PrismaTagMapper {
  static toDomain(raw: PrismaTag): Tag {
    return Tag.create(
      {
        name: raw.name,
        slug: Slug.createFromText(raw.name),
      },
      new UniqueEntityID(raw.id),
    );
  }

  static toPersistence(tag: Tag): Prisma.TagUncheckedCreateInput {
    return {
      id: tag.id.toValue(),
      name: tag.name,
      slug: tag.slug.value,
    };
  }

  static toUpdate(tag: Tag): Prisma.TagUncheckedUpdateInput {
    return {
      name: tag.name,
      slug: tag.slug.value,
    };
  }
}
