import { z } from 'zod';

import { Query, Param, Get, Controller, BadRequestException } from '@nestjs/common';
import { ImagePresenter } from '@/infra/http/presenters/image.presenter';
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation.pipe';
import { FetchImagesUseCase } from '@/domain/alcremie/application/use-cases/cases/fetch-images/fetch-images';
import { FetchImagesByTagUseCase } from '@/domain/alcremie/application/use-cases/cases/fetch-images-by-tag/fetch-images-by-tag';

const fetchImageParams = z.object({
  page: z.number().min(1),
});

const fetchImagesQuery = z.object({
  limit: z.number().default(25),
  q: z.string().default(''),
});

type FetchImageParams = z.infer<typeof fetchImageParams>;
type FetchImagesQuery = z.infer<typeof fetchImagesQuery>;

const queryValidationPipe = new ZodValidationPipe(fetchImagesQuery);

@Controller('image')
export class FetchImagesController {
  constructor(
    private readonly fetchImagesUseCase: FetchImagesUseCase,
    private readonly fetchImagesByTagUseCase: FetchImagesByTagUseCase,
  ) {}

  @Get(':page')
  async fetchImages(
    @Param() params: FetchImageParams,
    @Query(queryValidationPipe) query: FetchImagesQuery,
  ) {
    if (query.q === '') {
      const result = await this.fetchImagesUseCase.execute({
        page: params.page,
        size: query.limit,
      });

      if (result.isRight()) {
        const images = result.value?.images ?? [];

        return {
          images: images.map(ImagePresenter.toHTTP),
        };
      }
    }

    const result = await this.fetchImagesByTagUseCase.execute({
      page: params.page,
      size: query.limit,
      tagId: query.q,
    });

    if (result.isLeft()) {
      throw new BadRequestException();
    }

    const images = result.value.images;

    return {
      images: images.map(ImagePresenter.toHTTPWithoutTags),
    };
  }
}
