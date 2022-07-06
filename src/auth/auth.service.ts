import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { getConnection } from 'typeorm';
import { UserDto } from './dto/user.dto';
import uuidRandom from './uuidRandom';

@Injectable()
export class AuthService {
  private logger = new Logger('AuthService');
  constructor(private jwtService: JwtService) {}

  async loginCallBack(userDto: UserDto) {
    const { social_id, method, email, profile_img } = userDto;
    const verify = 'N';
    const status = 'P';
    const type = 'G';

    if (!social_id) {
      return Object.assign({
        statusCode: 400,
        message: '로그인 실패',
      });
    }

    const conn = getConnection();
    const [found] = await conn.query(
      `SELECT social_id FROM user WHERE social_id='${social_id}' AND status='P'`,
    );

    if (!found) {
      const user_id = uuidRandom(social_id);
      const payload = { user_id };
      const accessToken = this.jwtService.sign(payload, {
        expiresIn: `${process.env.JWT_SECRET_TIME}s`,
      });
      const refreshToken = this.jwtService.sign(payload, {
        expiresIn: `${process.env.REFRESH_JWT_SECRET_TIME}m`,
      });

      const sql =
        'INSERT INTO user(user_id, social_id, method, email, verify, status, type, create_at, profile_img, refresh_token) VALUES(?,?,?,?,?,?,?,NOW(),?,?)';
      const params = [
        user_id,
        social_id,
        method,
        email,
        verify,
        status,
        type,
        profile_img,
        refreshToken,
      ];

      await conn.query(sql, params);

      return Object.assign({
        statusCode: 200,
        message: '로그인 성공',
        verify: verify,
        accessToken: accessToken,
        refreshToken: refreshToken,
      });
    }

    const [user] = await conn.query(
      `SELECT user_id FROM user WHERE social_id='${social_id}' AND status='P'`,
    );
    const user_id = user.user_id;
    const payload = { user_id };
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: `${process.env.JWT_SECRET_TIME}s`,
    });
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: `${process.env.REFRESH_JWT_SECRET_TIME}m`,
    });

    await conn.query(
      `UPDATE user SET refresh_token='${refreshToken}' WHERE user_id='${user_id}' AND status='P'`,
    );

    const [user_verify] = await conn.query(
      `SELECT verify FROM user WHERE user_id='${user_id}' AND status='P'`,
    );

    return Object.assign({
      statusCode: 200,
      message: '로그인 성공',
      verify: user_verify.verify,
      accessToken: accessToken,
      refreshToken: refreshToken,
    });
  }

  async accessTokenReissuance(refreshToken: string) {
    const conn = getConnection();
    const [found] = await conn.query(
      `SELECT user_id FROM user WHERE refresh_token='${refreshToken}' AND status='P'`,
    );

    if (found) {
      const user_id = found.user_id;
      const payload = { user_id };
      const accessToken = this.jwtService.sign(payload, {
        expiresIn: `${process.env.JWT_SECRET_TIME}s`,
      });

      this.logger.verbose(`User ${user_id} accessToken 재발급 성공`);
      return Object.assign({
        statusCode: 200,
        message: 'accessToken 재발급 성공',
        accessToken: accessToken,
      });
    }

    return Object.assign({
      statusCode: 400,
      message: 'accessToken 재발급 실패',
    });
  }
}
