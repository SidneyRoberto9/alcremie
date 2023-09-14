import { UseGuards, Get, Controller } from '@nestjs/common';
import { Roles } from '@/infra/auth/utils/roles.decorator';
import { RoleGuard } from '@/infra/auth/guards/role.guard';
import { JwtAuthGuard } from '@/infra/auth/guards/jwt-auth.guard';

@Controller('tag')
@UseGuards(JwtAuthGuard, RoleGuard)
export class FetchTagController {
  @Get()
  @Roles('ADMIN')
  async fetchTag() {
    return { data: 'fetch tag' };
  }
}
