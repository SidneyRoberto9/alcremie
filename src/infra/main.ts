import * as cookieParser from 'cookie-parser';

import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from '@/infra/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors();
  app.use(cookieParser());

  const envService = app.get(ConfigService);
  const port = envService.get('PORT');
  const teste = envService.get('JWT_PRIVATE_KEY');

  await app.listen(port);
}
bootstrap();
