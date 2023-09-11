import { Module } from '@nestjs/common';

import { EnvService } from './env.service';

@Module({
  imports: [],
  controllers: [],
  providers: [EnvService],
})
export class EnvModule {}
