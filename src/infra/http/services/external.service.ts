import * as Fm from 'form-data';
import axios from 'axios';

import { Injectable, BadRequestException } from '@nestjs/common';
import { validateTagListNameIsNsfw } from '@/infra/http/utils/validate.nsfw';
import { validateTagNameString } from '@/infra/http/utils/validate.caracter';
import { MulterFile } from '@/infra/http/utils/multer.file';
import { TagService } from '@/infra/http/services/tag.service';
import { EnvService } from '@/infra/env/env.service';
import { CloudinaryUploadDataResponse } from '@/infra/cloudinary/utils/types';
import { CloudinaryService } from '@/infra/cloudinary/services/cloudinary.service';
import { CreateImageUseCase } from '@/domain/alcremie/application/use-cases/cases/create-image/create-image';

@Injectable()
export class ExternalService {
  constructor(
    private readonly cloudinary: CloudinaryService,
    private readonly envService: EnvService,
    private readonly tagService: TagService,
    private readonly createImageUseCase: CreateImageUseCase,
  ) {}

  async uploadImage(file: MulterFile) {
    const { size } = file;
    const rawTagsName = await this.getAllTagNamesFromImage(file);

    const { isNsfw, tagList } = validateTagListNameIsNsfw(rawTagsName);
    const { url, assetId } = await this.uploadImageToCloudinary(file);

    const tagIdList = await this.tagService.validateTagNameListInTagIdList(tagList);

    const { isLeft, value } = await this.createImageUseCase.execute({
      assetId,
      isNsfw,
      url,
      size,
      tagIds: tagIdList,
    });

    if (isLeft()) {
      return null;
    }

    return value['image'];
  }

  async uploadImageToCloudinary(file: MulterFile): Promise<CloudinaryUploadDataResponse> {
    const buf = file.buffer;

    return await this.cloudinary.uploadImage(buf).catch(() => {
      throw new BadRequestException('Invalid file type.');
    });
  }

  async getAllTagNamesFromImage(file: MulterFile): Promise<string[]> {
    const AI_HF = this.envService.get('HUGGING_FACE_API');

    const { buffer, originalname, mimetype } = file;

    const formData = new Fm();
    formData.append('picture', buffer, {
      contentType: mimetype,
      filename: originalname,
    });

    try {
      const { data } = await axios.post(AI_HF, formData, {
        headers: formData.getHeaders(),
      });

      const formattedTagsName: string[] = data[0]
        .map((tagName: string) => tagName.toLowerCase().trim())
        .filter((tagName: string) => !validateTagNameString(tagName));

      return formattedTagsName;
    } catch (error) {
      throw new BadRequestException('Invalid External Api.');
    }
  }
}
