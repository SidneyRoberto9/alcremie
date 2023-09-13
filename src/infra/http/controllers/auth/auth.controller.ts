import { Response, Request } from 'express';

import { UseGuards, Res, Req, HttpStatus, Get, Controller } from '@nestjs/common';
import { Public } from '@/infra/auth/utils/public.decorator';
import { AuthService } from '@/infra/auth/services/auth.service';
import { GoogleOauthGuard } from '@/infra/auth/guards/google-oauth.guard';

@Controller('auth/google')
@Public()
@UseGuards(GoogleOauthGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  async googleAth() {}

  @Get('callback')
  async googleAuthCallback(@Req() req: Request) {
    const token = await this.authService.signIn(req);

    req.res
      ?.cookie('access_token', token, {
        maxAge: 2592000000,
        sameSite: true,
        secure: false,
      })
      .status(HttpStatus.OK)
      .send({
        access_token: token,
      });
  }
}
