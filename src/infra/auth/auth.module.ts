import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { EnvService } from '@/infra/env/env.service';
import { EnvModule } from '@/infra/env/env.module';
import { DatabaseModule } from '@/infra/database/database.module';
import { JwtStrategy } from '@/infra/auth/strategies/jwt.strategy';
import { GoogleStrategy } from '@/infra/auth/strategies/google.strategy';
import { AuthService } from '@/infra/auth/services/auth.service';
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
          signOptions: { algorithm: 'RS256', expiresIn: '7d' },
          privateKey: Buffer.from(privateKey, 'base64'),
          publicKey: Buffer.from(publicKey, 'base64'),
        };
      },
    }),
  ],
  controllers: [],
  providers: [
    EnvService,
    AuthService,
    JwtStrategy,
    GoogleStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtStrategy,
    },
    RegisterUserUseCase,
  ],
  exports: [AuthService],
})
export class AuthModule {}
