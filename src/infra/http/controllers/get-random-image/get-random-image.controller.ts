import { z } from 'zod';

import { Query, Get, Controller, BadRequestException } from '@nestjs/common';
import { ImagePresenter } from '@/infra/http/presenters/image.presenter';
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation.pipe';
import { GetRandomImageUseCase } from '@/domain/alcremie/application/use-cases/cases/get-random-image/get-random-image';

const getRandomImageQuery = z.object({
  q: z.string().default(''),
});

type GetRandomImageQuery = z.infer<typeof getRandomImageQuery>;

const queryValidationPipe = new ZodValidationPipe(getRandomImageQuery);

@Controller('random-image')
export class GetRandomImageController {
  constructor(private readonly getRandomImageUseCase: GetRandomImageUseCase) {}

  @Get()
  async getRandomImage(@Query(queryValidationPipe) query: GetRandomImageQuery) {
    if (query.q === '') {
      const result = await this.getRandomImageUseCase.execute({});

      if (result.isLeft()) {
        throw new BadRequestException();
      }

      return ImagePresenter.toHTTPWithoutTags(result.value.image);
    }

    const result = await this.getRandomImageUseCase.execute({ tagId: query.q });

    if (result.isLeft()) {
      throw new BadRequestException();
    }

    return ImagePresenter.toHTTPWithoutTags(result.value.image);
  }
}
