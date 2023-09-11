export type RequestTypeValue = 'POST' | 'GET' | 'PUT' | 'DELETE';

export class RequestType {
  public value: RequestTypeValue;

  private constructor(value: RequestTypeValue) {
    this.value = value;
  }

  static create(value: RequestTypeValue) {
    return new RequestType(value);
  }
}
