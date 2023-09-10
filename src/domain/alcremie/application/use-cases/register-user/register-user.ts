import { Injectable } from '@nestjs/common';
import { User } from '@/domain/alcremie/enterprise/entities/user';
import { UserAlreadyExistError } from '@/domain/alcremie/application/use-cases/errors/UserAlreadyExist.error';
import { UserRepository } from '@/domain/alcremie/application/repositories/user.repository';
import { Either, right, left } from '@/core/either';

interface RegisterUserUseCaseRequest {
  name: string;
  email: string;
  avatarUrl: string;
}

type RegisterUserUseCaseResponse = Either<UserAlreadyExistError, { user: User }>;

@Injectable()
export class RegisterUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute({
    email,
    name,
    avatarUrl,
  }: RegisterUserUseCaseRequest): Promise<RegisterUserUseCaseResponse> {
    const userWithSameEmail = await this.userRepository.findByEmail(email);

    if (userWithSameEmail) {
      return left(new UserAlreadyExistError(email));
    }

    const user = User.create({
      name,
      email,
      avatarUrl,
    });

    await this.userRepository.create(user);

    return right({ user });
  }
}
