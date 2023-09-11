import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { EnvModule } from '@/infra/env/env.module';
import { envSchema } from '@/infra/env/env';

import { HttpModule } from './infra/http/http.module';
import { DatabaseModule } from './infra/database/database.module';

@Module({
  imports: [
    HttpModule,
    DatabaseModule,
    EnvModule,
    ConfigModule.forRoot({
      validate: (envConfig) => envSchema.parse(envConfig),
      isGlobal: true,
    }),
  ],
})
export class AppModule {}
