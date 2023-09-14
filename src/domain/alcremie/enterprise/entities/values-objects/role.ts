export type RoleType = 'DEFAULT' | 'ADMIN';

export class Role {
  public value: RoleType;

  private constructor(value: RoleType) {
    this.value = value;
  }

  static create(value: RoleType) {
    return new Role(value);
  }
}
