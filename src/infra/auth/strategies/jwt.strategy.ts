import { Strategy, ExtractJwt } from 'passport-jwt';
import { Request } from 'express';

import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { EnvService } from '@/infra/env/env.service';
import { JwtPayload, jwtPayloadSchema } from '@/infra/auth/utils/@types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: EnvService) {
    const publicKey = config.get('JWT_PUBLIC_KEY');

    const extractJwtFromCookie = (req: Request) => {
      let token = null;

      if (req && req.cookies) {
        token = req.cookies['access_token'];
      }

      if (token == null) {
        return ExtractJwt.fromAuthHeaderAsBearerToken();
      }

      return token;
    };

    super({
      jwtFromRequest: extractJwtFromCookie,
      secretOrKey: Buffer.from(publicKey, 'base64'),
      algorithms: ['RS256'],
    });
  }

  async validate(payload: JwtPayload) {
    return jwtPayloadSchema.parse(payload);
  }
}
