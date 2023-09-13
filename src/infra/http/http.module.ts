import { APP_INTERCEPTOR } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { TagService } from '@/infra/http/services/tag.service';
import { ExternalService } from '@/infra/http/services/external.service';
import { RequestInterceptor } from '@/infra/http/interceptors/request.interceptor';
import { UploadController } from '@/infra/http/controllers/upload/upload.controller';
import { FetchTagController } from '@/infra/http/controllers/fetch-tag/fetch-tag.controller';
import { AuthController } from '@/infra/http/controllers/auth/auth.controller';
import { EnvService } from '@/infra/env/env.service';
import { DatabaseModule } from '@/infra/database/database.module';
import { CloudinaryService } from '@/infra/cloudinary/services/cloudinary.service';
import { CloudinaryModule } from '@/infra/cloudinary/cloudinary.module';
import { AuthModule } from '@/infra/auth/auth.module';
import { RegisterRequestUseCase } from '@/domain/alcremie/application/use-cases/cases/register-request/register-request';
import { CreateTagUseCase } from '@/domain/alcremie/application/use-cases/cases/create-tag/create-tag';
import { CreateImageUseCase } from '@/domain/alcremie/application/use-cases/cases/create-image/create-image';

@Module({
  imports: [DatabaseModule, AuthModule, CloudinaryModule],
  controllers: [AuthController, FetchTagController, UploadController],
  providers: [
    EnvService,
    TagService,
    ExternalService,
    CloudinaryService,
    CreateImageUseCase,
    RegisterRequestUseCase,
    CreateTagUseCase,
    RequestInterceptor,
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestInterceptor,
    },
  ],
})
export class HttpModule {}
