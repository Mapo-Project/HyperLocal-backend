import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-naver-v2';
import { UserDto } from './dto/user.dto';

@Injectable()
export class NaverStrategy extends PassportStrategy(Strategy, 'naver') {
  constructor() {
    super({
      clientID: process.env.NAVER_CLIENTID,
      clientSecret: process.env.NAVER_CLIENTIDSECRET,
      callbackURL: process.env.NAVER_CALLBACKURL,
    });
  }

  async validate(accessToken, refreshToken, profile: any, done: any) {
    const payload: UserDto = {
      social_id: profile.id,
      role_id: 2,
      email: profile.email,
      profile_img: profile.profileImage,
    };

    return done(null, payload);
  }
}
