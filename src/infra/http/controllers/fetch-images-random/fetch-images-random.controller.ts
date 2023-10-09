import { z } from 'zod';

import { Query, Get, Controller } from '@nestjs/common';
import { ImagePresenter } from '@/infra/http/presenters/image.presenter';
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation.pipe';
import { FetchImagesRandomUseCase } from '@/domain/alcremie/application/use-cases/cases/fetch-images-random/fetch-images-random';

const fetchImagesQuery = z.object({
  limit: z.string().default('25'),
});

type FetchImagesQuery = z.infer<typeof fetchImagesQuery>;

const queryValidationPipe = new ZodValidationPipe(fetchImagesQuery);

@Controller('image-random')
export class FetchImagesRandomController {
  constructor(private readonly fetchImagesRandomUseCase: FetchImagesRandomUseCase) {}

  @Get('')
  async fetchImagesRandom(@Query(queryValidationPipe) query: FetchImagesQuery) {
    const result = await this.fetchImagesRandomUseCase.execute({
      size: Number(query.limit),
    });

    if (result.isRight()) {
      const images = result.value?.images ?? [];

      return {
        images: images.map(ImagePresenter.toHTTP),
      };
    }
  }
}
