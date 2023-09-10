import { UseCaseError } from '@/core/erros/use-case.error';

export class UserAlreadyExistError extends Error implements UseCaseError {
  constructor(identifier: string) {
    super(`User "${identifier}" already exists.`);
    this.name = 'UserAlreadyExistError';
  }
}
