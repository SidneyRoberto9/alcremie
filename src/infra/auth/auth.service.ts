import { JwtService } from '@nestjs/jwt';
import { InternalServerErrorException, Injectable, BadRequestException } from '@nestjs/common';
import { SignUser, JwtPayload } from '@/infra/auth/@types';
import { User } from '@/domain/alcremie/enterprise/entities/user';
import { RegisterUserUseCase } from '@/domain/alcremie/application/use-cases/cases/register-user/register-user';
import { UserRepository } from '@/domain/alcremie/application/repositories/user.repository';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userRepository: UserRepository,
    private registerUserUseCase: RegisterUserUseCase,
  ) {}

  generateJwt(payload: JwtPayload) {
    return this.jwtService.sign(payload);
  }

  async signIn(user: SignUser) {
    if (!user) {
      throw new BadRequestException('Unauthenticated');
    }

    const userExists = await this.userRepository.findByEmail(user.email);

    if (!userExists) {
      return this.registerUser(user);
    }

    return this.generateJwtWithUser(userExists);
  }

  async registerUser(user: SignUser) {
    const createdUser = User.create({
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
    });

    await this.userRepository.create(createdUser);

    const savedUser = await this.userRepository.findByEmail(user.email);

    if (!savedUser) {
      throw new InternalServerErrorException();
    }

    return this.generateJwtWithUser(savedUser);
  }

  async generateJwtWithUser(user: User) {
    const generateJwtObj: JwtPayload = {
      sub: user.id.toValue(),
      email: user.email,
    };

    return this.generateJwt(generateJwtObj);
  }
}
