import { InMemoryUserRepository } from '@/test/repositories/in-memory-user.repository';
import { makeUser } from '@/test/factory/make-user';
import { UserAlreadyExistError } from '@/domain/alcremie/application/use-cases/errors/UserAlreadyExist.error';
import { RegisterUserUseCase } from '@/domain/alcremie/application/use-cases/cases/register-user/register-user';

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

  it('should not be able to register a new user with same email', async () => {
    const user = makeUser({
      email: 'johndoe@example.com',
    });

    inMemoryUserRepository.items.push(user);

    const result = await sut.execute({
      name: 'John Doe',
      email: 'johndoe@example.com',
      avatarUrl: 'http://example.com/avatar.png',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserAlreadyExistError);
  });
});
