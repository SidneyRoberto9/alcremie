import { InMemoryUserRepository } from '@/test/repositories/in-memory-user.repository';
import { RegisterUserUseCase } from '@/domain/alcremie/application/use-cases/register-user/register-user';

let inMemoryUserRepository: InMemoryUserRepository;
let sut: RegisterUserUseCase;

describe('Register User', () => {
  beforeEach(() => {
    inMemoryUserRepository = new InMemoryUserRepository();
    sut = new RegisterUserUseCase(inMemoryUserRepository);
  });

  it('should be able to register a new user', async () => {
    const result = await sut.execute({
      name: 'John Doe',
      email: 'johndoe@example.com',
      avatarUrl: 'http://example.com/avatar.png',
    });

    expect(result.isRight()).toBe(true);
    expect(result.value).toEqual({
      user: inMemoryUserRepository.items[0],
    });
  });
});
