import { UseCaseError } from '@/core/erros/use-case.error';

export class ResourceNotFoundError extends Error implements UseCaseError {
  constructor() {
    super('Resource not found');
    this.name = 'ResourceNotFoundError';
  }
}
