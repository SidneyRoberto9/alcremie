import { Get, Controller, BadRequestException } from '@nestjs/common';
import { GetStatisticsUseCase } from '@/domain/alcremie/application/use-cases/cases/get-statistics/get-statistics';

@Controller('status')
export class GetStatusController {
  constructor(private readonly getStatisticsUseCase: GetStatisticsUseCase) {}

  @Get()
  async getStatus() {
    const result = await this.getStatisticsUseCase.execute({});

    if (result.isLeft()) {
      throw new BadRequestException();
    }

    return {
      statistics: result.value,
    };
  }
}
