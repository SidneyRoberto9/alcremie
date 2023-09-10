import { UniqueEntityID } from '@/core/entities/unique-entity-id';

export class Entity<T> {
  private _id: UniqueEntityID;
  protected props: T;

  protected constructor(props: T, id?: UniqueEntityID) {
    this.props = props;
    this._id = id ?? new UniqueEntityID();
  }

  public equals(entity: Entity<T>): boolean {
    if (entity === this) {
      return true;
    }

    if (entity.id === this._id) {
      return true;
    }

    return false;
  }

  get id(): UniqueEntityID {
    return this._id;
  }
}
