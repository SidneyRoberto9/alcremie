import { InMemoryRequestRepository } from '@/test/repositories/in-memory-request.repository';
import { RegisterRequestUseCase } from '@/domain/alcremie/application/use-cases/cases/register-request/register-request';

let inMemoryRequestRepository: InMemoryRequestRepository;
let sut: RegisterRequestUseCase;

describe('Register Request', () => {
  beforeEach(() => {
    inMemoryRequestRepository = new InMemoryRequestRepository();
    sut = new RegisterRequestUseCase(inMemoryRequestRepository);
  });

  it('should be able to register a new request', async () => {
    const result = await sut.execute({
      requestType: 'GET',
      route: '/sessions',
    });

    expect(result.isRight()).toBe(true);
    expect(result.value).toEqual({
      request: inMemoryRequestRepository.items[0],
    });
  });
});
