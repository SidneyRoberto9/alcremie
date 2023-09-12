import { Module } from '@nestjs/common';
import { FetchTagController } from '@/infra/http/controllers/fetch-tag/fetch-tag.controller';
import { AuthController } from '@/infra/http/controllers/auth/auth.controller';
import { DatabaseModule } from '@/infra/database/database.module';
import { AuthModule } from '@/infra/auth/auth.module';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [AuthController, FetchTagController],
  providers: [],
})
export class HttpModule {}
