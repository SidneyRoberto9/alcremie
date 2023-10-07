import { Favorite } from '@/domain/alcremie/enterprise/entities/favorite';

export abstract class FavoriteRepository {
  abstract create(favorite: Favorite): Promise<void>;
  abstract delete(favorite: Favorite): Promise<void>;
  abstract findByUserIdAndImageId(userId: string, imageId: string): Promise<Favorite | null>;
}
