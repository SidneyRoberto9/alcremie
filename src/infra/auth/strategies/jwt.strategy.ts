import { ExtractJwt } from 'passport-jwt';
import { Strategy } from 'passport-google-oauth2';
import { Request } from 'express';

import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { EnvService } from '@/infra/env/env.service';
import { JwtPayload, jwtPayloadSchema } from '@/infra/auth/@types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: EnvService) {
    const publicKey = config.get('JWT_PUBLIC_KEY');

    const extractJwtFromCookie = (req: Request) => {
      let token = null;

      if (req && req.cookies) {
        token = req.cookies['access_token'];
      }

      return token || ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    };

    super({
      clientID: publicKey,
      ignoreExpiration: false,
      secretOrKey: Buffer.from(publicKey, 'base64'),
      jwtFromRequest: extractJwtFromCookie,
    });
  }

  async validate(payload: JwtPayload) {
    return jwtPayloadSchema.parse(payload);
  }
}
