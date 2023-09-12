import { UseGuards, Get, Controller } from '@nestjs/common';
import { JwtAuthGuard } from '@/infra/auth/guards/jwt-auth.guard';

@Controller('tag')
@UseGuards(JwtAuthGuard)
export class FetchTagController {
  @Get()
  async fetchTag() {
    return { data: 'fetch tag' };
  }
}
