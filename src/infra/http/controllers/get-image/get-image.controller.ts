import { z } from 'zod';

import { Param, Get, Controller, BadRequestException } from '@nestjs/common';
import { ImagePresenter } from '@/infra/http/presenters/image.presenter';
import { GetImageByIdUseCase } from '@/domain/alcremie/application/use-cases/cases/get-image-by-id/get-image-by-id';

const fetchImageParams = z.object({
  id: z.string(),
});

type FetchImageParams = z.infer<typeof fetchImageParams>;

@Controller('image/find')
export class GetImageController {
  constructor(private readonly getImageByIdUseCase: GetImageByIdUseCase) {}

  @Get(':id')
  async getImage(@Param() params: FetchImageParams) {
    const result = await this.getImageByIdUseCase.execute({
      id: params.id,
    });

    if (result.isLeft()) {
      throw new BadRequestException();
    }

    return { image: ImagePresenter.toHTTP(result.value.image) };
  }
}
