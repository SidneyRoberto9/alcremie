import { UseGuards, Param, Get, Controller, BadRequestException } from '@nestjs/common';
import { Roles } from '@/infra/auth/utils/roles.decorator';
import { CurrentUser } from '@/infra/auth/utils/current-user.decorator';
import { JwtPayload } from '@/infra/auth/utils/@types';
import { JwtAuthGuard } from '@/infra/auth/guards/jwt-auth.guard';
import { FavoriteImageUseCase } from '@/domain/alcremie/application/use-cases/cases/favorite-image/favorite-image';

interface FavoriteImageParams {
  imageId: string;
}

@Controller('favorite')
@UseGuards(JwtAuthGuard)
export class FavoriteImageController {
  constructor(private readonly favoriteImageUseCase: FavoriteImageUseCase) {}

  @Get(':imageId')
  async favoriteImage(@Param() params: FavoriteImageParams, @CurrentUser() user: JwtPayload) {
    const result = await this.favoriteImageUseCase.execute({
      imageId: params.imageId,
      userId: user.sub,
    });

    if (result.isRight()) {
      return {
        isFavorite: result.value['isFavorite'],
      };
    }

    throw new BadRequestException();
  }
}
