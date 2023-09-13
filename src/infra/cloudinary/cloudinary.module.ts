import { Module } from '@nestjs/common';
import { EnvService } from '@/infra/env/env.service';
import { CloudinaryService } from '@/infra/cloudinary/services/cloudinary.service';

@Module({
  exports: [CloudinaryService],
  providers: [CloudinaryService, EnvService],
})
export class CloudinaryModule {}
