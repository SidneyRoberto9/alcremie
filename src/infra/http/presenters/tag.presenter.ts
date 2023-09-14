import { Tag } from '@/domain/alcremie/enterprise/entities/tag';

export class TagPresenter {
  static toHTTP(tag: Tag) {
    return {
      id: tag.id.toValue(),
      name: tag.name,
      slug: tag.slug.value,
    };
  }
}
