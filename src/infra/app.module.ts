import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { HttpModule } from '@/infra/http/http.module';
import { EnvModule } from '@/infra/env/env.module';
import { envSchema } from '@/infra/env/env';
import { DatabaseModule } from '@/infra/database/database.module';
import { AuthModule } from '@/infra/auth/auth.module';

@Module({
  imports: [
    EnvModule,
    AuthModule,
    HttpModule,
    DatabaseModule,
    ConfigModule.forRoot({
      validate: (envConfig) => envSchema.parse(envConfig),
      isGlobal: true,
    }),
  ],
})
export class AppModule {}
