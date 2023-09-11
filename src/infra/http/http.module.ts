import { Module } from '@nestjs/common';
import { AuthController } from '@/infra/http/controllers/auth/auth.controller';
import { DatabaseModule } from '@/infra/database/database.module';
import { AuthModule } from '@/infra/auth/auth.module';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [AuthController],
  providers: [],
})
export class HttpModule {}
