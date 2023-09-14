import { Image } from '@/domain/alcremie/enterprise/entities/image';

export class ImagePresenter {
  static toHTTP(image: Image) {
    return {
      id: image.id.toValue(),
      assetId: image.assetId,
      isNsfw: image.isNsfw,
      size: image.size,
      url: image.url,
      createdAt: image.createdAt,
      updatedAt: image.updatedAt,
      tags: image.tags.map((tag) => ({ id: tag })),
    };
  }
}
