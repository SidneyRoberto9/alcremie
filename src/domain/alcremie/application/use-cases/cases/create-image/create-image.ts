import { Injectable, ConflictException } from '@nestjs/common';
import { Image } from '@/domain/alcremie/enterprise/entities/image';
import { TagRepository } from '@/domain/alcremie/application/repositories/tag.repository';
import { ImageRepository } from '@/domain/alcremie/application/repositories/image.repository';
import { Either, right, left } from '@/core/either';

interface CreateImageUseCaseRequest {
  isNsfw: boolean;
  assetId: string;
  url: string;
  size: number;
  tagIds: string[];
}

type CreateImageUseCaseResponse = Either<ConflictException, { image: Image }>;

@Injectable()
export class CreateImageUseCase {
  constructor(private imageRepository: ImageRepository, private tagRepository: TagRepository) {}

  async execute({
    assetId,
    isNsfw,
    size,
    url,
    tagIds,
  }: CreateImageUseCaseRequest): Promise<CreateImageUseCaseResponse> {
    const imageWithSameAssetId = await this.imageRepository.findByAssetId(assetId);

    if (imageWithSameAssetId) {
      return left(new ConflictException());
    }

    const image = Image.create({
      assetId,
      isNsfw,
      size,
      url,
      tags: tagIds,
    });

    await this.imageRepository.create(image);
    await this.tagRepository.addManyImageRelation(tagIds, image.id.toValue());

    return right({ image });
  }
}
