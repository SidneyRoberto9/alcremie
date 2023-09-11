import { send } from 'process';
import { Response, Request } from 'express';
import { Sign } from 'crypto';

import { UseGuards, Res, Req, HttpStatus, Get, Controller } from '@nestjs/common';
import { GoogleOauthGuard } from '@/infra/auth/guards/google-oauth.guard';
import { AuthService } from '@/infra/auth/auth.service';
import { SignUser } from '@/infra/auth/@types';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('google')
  @UseGuards(GoogleOauthGuard)
  async auth() {}

  @Get('google/callback')
  @UseGuards(GoogleOauthGuard)
  async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    const token = await this.authService.signIn(req.user as SignUser);

    res
      .cookie('access_token', token, {
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
