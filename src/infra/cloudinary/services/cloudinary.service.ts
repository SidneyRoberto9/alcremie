import * as sharp from 'sharp';
import { v2 as cloudinary } from 'cloudinary';

import { Injectable } from '@nestjs/common';
import { MulterFile } from '@/infra/http/utils/multer.file';
import { EnvService } from '@/infra/env/env.service';
import { CloudinaryUploadDataResponse } from '@/infra/cloudinary/utils/types';
import { BUCKET_NAME } from '@/infra/cloudinary/utils/constant';

@Injectable()
export class CloudinaryService {
  constructor(private readonly environmentService: EnvService) {
    const cloudName = environmentService.get('CLOUDINARY_CLOUD_NAME');
    const apiKey = environmentService.get('CLOUDINARY_API_KEY');
    const apiSecret = environmentService.get('CLOUDINARY_API_SECRET');

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });
  }

  async uploadImage(buffer: Buffer): Promise<CloudinaryUploadDataResponse> {
    const sharpFileBuffer = await sharp(buffer).webp({ quality: 90 }).toBuffer();

    return new Promise<CloudinaryUploadDataResponse>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: BUCKET_NAME,
          },
          (error, result) => {
            if (result) {
              const data: CloudinaryUploadDataResponse = {
                assetId: result.asset_id,
                url: result.url,
              };
              resolve(data);
            } else {
              console.log(error);
              reject(error);
            }
          },
        )
        .end(sharpFileBuffer);
    });
  }
}
