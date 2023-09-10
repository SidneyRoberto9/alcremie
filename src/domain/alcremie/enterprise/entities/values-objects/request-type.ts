export class RequestType {
  public value: 'POST' | 'GET' | 'PUT' | 'DELETE';

  private constructor(value: 'POST' | 'GET' | 'PUT' | 'DELETE') {
    this.value = value;
  }

  static create(value: 'POST' | 'GET' | 'PUT' | 'DELETE') {
    return new RequestType(value);
  }
}
