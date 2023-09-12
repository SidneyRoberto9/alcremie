import 'dotenv/config';

import { VerifyCallback, Strategy } from 'passport-google-oauth2';

import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { EnvService } from '@/infra/env/env.service';
import { SignUser } from '@/infra/auth/utils/@types';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor(config: EnvService) {
    const clientId = config.get('GOOGLE_CLIENT_ID');
    const secretKey = config.get('GOOGLE_SECRET_KEY');
    const callbackURL = config.get('GOOGLE_CALLBACK_URL');

    super({
      clientID: clientId,
      clientSecret: secretKey,
      callbackURL: callbackURL,
      scope: ['profile', 'email'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { name, emails, photos } = profile;

    const user: SignUser = {
      email: emails[0].value,
      name: `${name.givenName} ${name.familyName}`,
      avatarUrl: photos[0].value,
    };

    done(null, user);
  }
}
