import 'multer';

import { FilesInterceptor } from '@nestjs/platform-express';
import { UseInterceptors, UploadedFiles, Post, Controller, Bind } from '@nestjs/common';
import { MulterFiles } from '@/infra/http/utils/multer.file';
import { ExternalService } from '@/infra/http/services/external.service';
import { ImagePresenter } from '@/infra/http/presenters/image.presenter';
import { Image } from '@/domain/alcremie/enterprise/entities/image';

@Controller('upload')
export class UploadController {
  constructor(private readonly externalService: ExternalService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('image'))
  @Bind(UploadedFiles())
  async uploadFile(files: MulterFiles) {
    let images: Image[] = [];

    for (let file of files) {
      const data = await this.externalService.uploadImage(file);
      images.push(data);
    }

    return {
      images: images.map(ImagePresenter.toHTTP),
    };
  }
}
