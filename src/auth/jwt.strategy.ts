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
      `SELECT USER_ID AS user_id FROM USER WHERE USER_ID='${user_id}' AND STATUS='P'`,
    );

    if (!user) {
      throw new UnauthorizedException();
    }

    return user.user_id;
  }
}
