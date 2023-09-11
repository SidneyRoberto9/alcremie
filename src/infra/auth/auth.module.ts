import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { Module } from '@nestjs/common';
import { EnvService } from '@/infra/env/env.service';
import { EnvModule } from '@/infra/env/env.module';
import { DatabaseModule } from '@/infra/database/database.module';
import { JwtStrategy } from '@/infra/auth/strategies/jwt.strategy';
import { GoogleStrategy } from '@/infra/auth/strategies/google.strategy';
import { AuthService } from '@/infra/auth/auth.service';
import { RegisterUserUseCase } from '@/domain/alcremie/application/use-cases/cases/register-user/register-user';

@Module({
  imports: [
    DatabaseModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [EnvModule],
      inject: [EnvService],
      global: true,
      useFactory(env: EnvService) {
        const privateKey = env.get('JWT_PRIVATE_KEY');
        const publicKey = env.get('JWT_PUBLIC_KEY');

        return {
          signOptions: { algorithm: 'RS256' },
          privateKey: Buffer.from(privateKey, 'base64'),
          publicKey: Buffer.from(publicKey, 'base64'),
        };
      },
    }),
  ],
  controllers: [],
  providers: [AuthService, JwtStrategy, GoogleStrategy, EnvService, RegisterUserUseCase],
  exports: [AuthService],
})
export class AuthModule {}
