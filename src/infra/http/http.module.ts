import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { TagService } from '@/infra/http/services/tag.service';
import { ExternalService } from '@/infra/http/services/external.service';
import { RequestInterceptor } from '@/infra/http/interceptors/request.interceptor';
import { UploadController } from '@/infra/http/controllers/upload/upload.controller';
import { GetStatusController } from '@/infra/http/controllers/get-status/get-status.controller';
import { GetRandomImageController } from '@/infra/http/controllers/get-random-image/get-random-image.controller';
import { FetchTagController } from '@/infra/http/controllers/fetch-tag/fetch-tag.controller';
import { FetchImagesController } from '@/infra/http/controllers/fetch-images/fetch-images.controller';
import { FavoriteImageController } from '@/infra/http/controllers/favorite-image/favorite-image.controller';
import { DeleteImageController } from '@/infra/http/controllers/delete-image/delete-image.controller';
import { AuthController } from '@/infra/http/controllers/auth/auth.controller';
import { EnvService } from '@/infra/env/env.service';
import { DatabaseModule } from '@/infra/database/database.module';
import { CloudinaryService } from '@/infra/cloudinary/services/cloudinary.service';
import { CloudinaryModule } from '@/infra/cloudinary/cloudinary.module';
import { AuthModule } from '@/infra/auth/auth.module';
import { RegisterRequestUseCase } from '@/domain/alcremie/application/use-cases/cases/register-request/register-request';
import { GetStatisticsUseCase } from '@/domain/alcremie/application/use-cases/cases/get-statistics/get-statistics';
import { GetRandomImageUseCase } from '@/domain/alcremie/application/use-cases/cases/get-random-image/get-random-image';
import { FetchTagsUseCase } from '@/domain/alcremie/application/use-cases/cases/fetch-tags/fetch-tags';
import { FetchImagesUseCase } from '@/domain/alcremie/application/use-cases/cases/fetch-images/fetch-images';
import { FetchImagesByTagUseCase } from '@/domain/alcremie/application/use-cases/cases/fetch-images-by-tag/fetch-images-by-tag';
import { FavoriteImageUseCase } from '@/domain/alcremie/application/use-cases/cases/favorite-image/favorite-image';
import { DeleteImageUseCase } from '@/domain/alcremie/application/use-cases/cases/delete-image/delete-image';
import { CreateTagUseCase } from '@/domain/alcremie/application/use-cases/cases/create-tag/create-tag';
import { CreateImageUseCase } from '@/domain/alcremie/application/use-cases/cases/create-image/create-image';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    CloudinaryModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 60,
      },
      {
        ttl: 1000,
        limit: 3,
      },
    ]),
  ],
  controllers: [
    AuthController,
    UploadController,
    FetchTagController,
    GetStatusController,
    DeleteImageController,
    FetchImagesController,
    FavoriteImageController,
    GetRandomImageController,
  ],
  providers: [
    // Services
    EnvService,
    TagService,
    ExternalService,
    CloudinaryService,

    // Use Cases
    FetchTagsUseCase,
    CreateTagUseCase,
    CreateImageUseCase,
    DeleteImageUseCase,
    FetchImagesUseCase,
    FavoriteImageUseCase,
    GetStatisticsUseCase,
    GetRandomImageUseCase,
    RegisterRequestUseCase,
    FetchImagesByTagUseCase,

    //interceptors
    RequestInterceptor,
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestInterceptor,
    },

    //guard
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class HttpModule {}
