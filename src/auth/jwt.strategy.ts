import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { getConnection } from 'typeorm';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      secretOrKey: `${process.env.JWT_SECRET}`,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate(payload: any) {
    const { user_id } = payload;

    const conn = getConnection();
    const [user] = await conn.query(
      `SELECT user_id FROM user WHERE user_id='${user_id}' AND status='P'`,
    );

    if (!user) {
      throw new UnauthorizedException();
    }

    return user.user_id;
  }
}
