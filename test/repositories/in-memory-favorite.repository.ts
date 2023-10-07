import { Favorite } from '@/domain/alcremie/enterprise/entities/favorite';
import { FavoriteRepository } from '@/domain/alcremie/application/repositories/favorite.repository';

export class InMemoryFavoriteRepository implements FavoriteRepository {
  public items: Favorite[] = [];

  async create(favorite: Favorite): Promise<void> {
    this.items.push(favorite);
  }

  async delete(favorite: Favorite): Promise<void> {
    const itemIndex = this.items.findIndex((item) => item.id === favorite.id);
    this.items.splice(itemIndex, 1);
  }

  async findByUserIdAndImageId(userId: string, imageId: string): Promise<Favorite | null> {
    const favorite = this.items.find(
      (item) => item.imageId.toValue() === imageId && item.userId.toValue() === userId,
    );

    if (!favorite) {
      return null;
    }

    return favorite;
  }
}
