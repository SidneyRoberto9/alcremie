import { ObjectId } from 'bson';

export class UniqueEntityID {
  private value: ObjectId;

  constructor(value?: string) {
    this.value = new ObjectId(value);
  }

  equals(id: UniqueEntityID): boolean {
    return id.toValue() === this.value.toString();
  }

  toValue(): string {
    return this.value.toHexString();
  }
}
