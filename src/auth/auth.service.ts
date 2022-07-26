import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { getConnection } from 'typeorm';
import {
  AccessTokenReissuanceInputDto,
  AccessTokenReissuanceOutputDto,
} from './dto/acess.token.dto';
import { UserDto, UserSocialLoginOutputDto } from './dto/user.dto';
import uuidRandom from './uuidRandom';

@Injectable()
export class AuthService {
  private logger = new Logger('AuthService');
  constructor(private jwtService: JwtService) {}

  async loginCallBack(userDto: UserDto): Promise<UserSocialLoginOutputDto> {
    const { social_id, role_id, email, profile_img } = userDto;
    const verify = 'N';
    const status = 'P';

    if (!social_id) {
      return Object.assign({
        statusCode: 400,
        message: '로그인 실패',
      });
    }

    const conn = getConnection();
    const [found] = await conn.query(
      `SELECT SOCIAL_ID FROM USER WHERE SOCIAL_ID='${social_id}' AND STATUS='P'`,
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

      const sql = `INSERT INTO USER(USER_ID, ROLE_ID, SOCIAL_ID, EMAIL, VERIFY, STATUS, INSERT_DT, INSERT_ID, PROFILE_IMG, REFRESH_TOKEN) 
                   VALUES(?,?,?,?,?,?,NOW(),?,?,?)`;
      const params = [
        user_id,
        role_id,
        social_id,
        email,
        verify,
        status,
        user_id,
        profile_img,
        refreshToken,
      ];

      await conn.query(sql, params);

      return {
        statusCode: 200,
        message: '로그인 성공',
        verify: verify,
        accessToken: accessToken,
        refreshToken: refreshToken,
      };
    }

    const [user] = await conn.query(
      `SELECT USER_ID FROM USER WHERE SOCIAL_ID='${social_id}' AND STATUS='P'`,
    );
    const user_id = user.USER_ID;
    const payload = { user_id };
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: `${process.env.JWT_SECRET_TIME}s`,
    });
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: `${process.env.REFRESH_JWT_SECRET_TIME}m`,
    });

    await conn.query(
      `UPDATE USER SET REFRESH_TOKEN='${refreshToken}', UPDATE_DT=NOW(), UPDATE_ID='${user_id}' 
       WHERE USER_ID='${user_id}' AND STATUS='P'`,
    );

    const [user_verify] = await conn.query(
      `SELECT VERIFY FROM USER WHERE USER_ID='${user_id}' AND STATUS='P'`,
    );

    return {
      statusCode: 200,
      message: '로그인 성공',
      verify: user_verify.VERIFY,
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  }

  async accessTokenReissuance(
    accessTokenReissuanceInputDto: AccessTokenReissuanceInputDto,
  ): Promise<AccessTokenReissuanceOutputDto> {
    const { refreshToken } = accessTokenReissuanceInputDto;
    const conn = getConnection();

    const [found] = await conn.query(
      `SELECT USER_ID FROM USER WHERE REFRESH_TOKEN='${refreshToken}' AND STATUS='P'`,
    );

    if (found) {
      const user_id = found.USER_ID;
      const payload = { user_id };
      const accessToken = this.jwtService.sign(payload, {
        expiresIn: `${process.env.JWT_SECRET_TIME}s`,
      });

      this.logger.verbose(`User ${user_id} accessToken 재발급 성공`);
      return {
        statusCode: 200,
        message: 'accessToken 재발급 성공',
        accessToken: accessToken,
      };
    }
    throw new HttpException('accessToken 재발급 실패', HttpStatus.BAD_REQUEST);
  }
}
