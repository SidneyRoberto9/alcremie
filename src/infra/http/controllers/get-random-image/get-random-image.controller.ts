import { Get, Controller, BadRequestException } from '@nestjs/common';
import { ImagePresenter } from '@/infra/http/presenters/image.presenter';
import { GetRandomImageUseCase } from '@/domain/alcremie/application/use-cases/cases/get-random-image/get-random-image';

@Controller('random-image')
export class GetRandomImageController {
  constructor(private readonly getRandomImageUseCase: GetRandomImageUseCase) {}

  @Get()
  async getRandomImage() {
    const result = await this.getRandomImageUseCase.execute({});

    if (result.isLeft()) {
      throw new BadRequestException();
    }

    return ImagePresenter.toHTTPWithoutTags(result.value.image);
  }
}
