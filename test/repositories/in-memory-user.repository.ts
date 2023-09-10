import { User } from '@/domain/alcremie/enterprise/entities/user';
import { UserRepository } from '@/domain/alcremie/application/repositories/user.repository';

export class InMemoryUserRepository implements UserRepository {
  public items: User[] = [];

  async findById(id: string): Promise<User | null> {
    const user = this.items.find((user) => user.id.toValue() === id);

    if (!user) {
      return null;
    }

    return user;
  }

  async save(user: User): Promise<void> {
    const itemIndex = this.items.findIndex((item) => item.id === user.id);
    this.items[itemIndex] = user;
  }

  async create(user: User) {
    this.items.push(user);
  }

  async findByEmail(email: string) {
    const user = this.items.find((user) => user.email === email);

    if (!user) {
      return null;
    }

    return user;
  }
}
