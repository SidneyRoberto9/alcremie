import {
  UseGuards,
  Param,
  HttpCode,
  Delete,
  Controller,
  BadRequestException,
} from '@nestjs/common';
import { Roles } from '@/infra/auth/utils/roles.decorator';
import { RoleGuard } from '@/infra/auth/guards/role.guard';
import { JwtAuthGuard } from '@/infra/auth/guards/jwt-auth.guard';
import { DeleteImageUseCase } from '@/domain/alcremie/application/use-cases/cases/delete-image/delete-image';

interface DeleteImageParams {
  id: string;
}

@Controller('image')
@UseGuards(JwtAuthGuard, RoleGuard)
@Controller()
export class DeleteImageController {
  constructor(private readonly deleteImageUseCase: DeleteImageUseCase) {}

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(204)
  async deleteImage(@Param() params: DeleteImageParams) {
    const result = await this.deleteImageUseCase.execute({
      imageId: params.id,
    });

    if (result.isLeft()) {
      throw new BadRequestException();
    }
  }
}
