import { Injectable, Logger } from '@nestjs/common';
import { getConnection } from 'typeorm';
import { NickNameDuplicateInputDto } from './dto/user.duplicate.dto';
import {
  ModifyProfileDetailInputDto,
  ProfileDetailInputDto,
} from './dto/user.profile.dto';
import { createImageURL } from './multerOptions';

@Injectable()
export class UserService {
  private logger = new Logger('UserService');

  async nickNameDuplicate(
    nickNameDuplicateInputDto: NickNameDuplicateInputDto,
  ) {
    const { nickname } = nickNameDuplicateInputDto;

    const conn = getConnection();
    const [found] = await conn.query(
      `SELECT nickname FROM user WHERE nickname='${nickname}'`,
    );

    this.logger.verbose(`Nickname: ${nickname} 중복체크`);
    return found
      ? Object.assign({
          statusCode: 200,
          message: '닉네임 중복체크 조회 성공',
          duplicate: 'true',
        })
      : Object.assign({
          statusCode: 200,
          message: '닉네임 중복체크 조회 성공',
          duplicate: 'false',
        });
  }

  async addUserProfile(
    user_id: string,
    profileDetailInputDto: ProfileDetailInputDto,
  ) {
    const { name, nickname } = profileDetailInputDto;

    const conn = getConnection();
    const [found] = await conn.query(
      `SELECT nickname FROM user WHERE nickname='${nickname}'`,
    );

    if (!found) {
      await conn.query(
        `UPDATE user SET name='${name}', nickname='${nickname}', verify='Y', update_at=NOW() 
        WHERE user_id='${user_id}' AND status='P'`,
      );
      this.logger.verbose(`User ${user_id} 회원 프로필 추가정보 등록 성공`);
      return Object.assign({
        statusCode: 201,
        message: '회원 프로필 추가정보 등록 성공',
      });
    }

    this.logger.verbose(`User ${user_id} 회원 프로필 추가정보 등록 실패`);
    return Object.assign({
      statusCode: 400,
      message: '회원 프로필 추가정보 등록 실패',
    });
  }

  async getUserProfile(user_id: string) {
    const conn = getConnection();
    const [user] = await conn.query(
      `SELECT name, nickname, method, email, profile_img FROM user 
      WHERE user_id='${user_id}' AND verify='Y' AND status='P'`,
    );

    if (user) {
      this.logger.verbose(`User ${user_id} 회원 프로필 조회 성공`);
      return Object.assign({
        statusCode: 200,
        message: '회원 프로필 조회 성공',
        data: user,
      });
    } else {
      this.logger.verbose(`User ${user_id} 회원 프로필 조회 실패`);
      return Object.assign({
        statusCode: 400,
        message: '회원 프로필 조회 실패',
      });
    }
  }

  async modifyUserProfile(
    user_id: string,
    modifyProfileDetailInputDto: ModifyProfileDetailInputDto,
  ) {
    const { name, nickname, email } = modifyProfileDetailInputDto;
    const conn = getConnection();

    const [found] = await conn.query(
      `SELECT nickname FROM user WHERE nickname = 
      (SELECT nickname FROM user WHERE nickname = '${nickname}') 
      AND nickname <> (SELECT nickname FROM user WHERE user_id = '${user_id}' AND status = 'P')`,
    );

    if (!found) {
      await conn.query(
        `UPDATE user SET name='${name}', nickname='${nickname}', email='${email}', update_at=NOW()
        WHERE user_id='${user_id}' AND verify='Y' AND status='P' `,
      );

      this.logger.verbose(`User ${user_id} 회원 프로필 수정 성공`);
      return Object.assign({
        statusCode: 201,
        message: '회원 프로필 수정 성공',
      });
    }

    this.logger.verbose(`User ${user_id} 회원 프로필 수정 실패`);
    return Object.assign({
      statusCode: 400,
      message: '회원 프로필 수정 실패',
    });
  }

  async modifyUserProfileImg(user_id: string, file: string) {
    if (file) {
      const generatedFile = createImageURL(file);
      const conn = getConnection();

      await conn.query(
        `UPDATE user SET profile_img='${generatedFile}', update_at=NOW()
          WHERE user_id='${user_id}' AND verify='Y' AND status='P' `,
      );

      this.logger.verbose(`User ${user_id} 회원 프로필 이미지 수정 성공`);
      return Object.assign({
        statusCode: 201,
        message: '회원 프로필 이미지 수정 성공',
      });
    }

    this.logger.verbose(`User ${user_id} 회원 프로필 이미지 수정 실패`);
    return Object.assign({
      statusCode: 400,
      message: '회원 프로필 이미지 수정 실패',
    });
  }

  async userLogout(user_id: string) {
    const conn = getConnection();
    await conn.query(
      `UPDATE user SET refresh_token= NULL WHERE user_id='${user_id}' AND status='P'`,
    );

    this.logger.verbose(`User ${user_id} 회원 로그아웃 성공`);
    return Object.assign({
      statusCode: 200,
      message: '회원 로그아웃 성공',
    });
  }

  async userWithdrawal(user_id: string) {
    const conn = getConnection();
    await conn.query(
      `UPDATE user SET status='D', delete_at=NOW() WHERE user_id='${user_id}' AND status='P'`,
    );

    this.logger.verbose(`User ${user_id} 회원 탈퇴 성공`);
    return Object.assign({
      statusCode: 200,
      message: '회원 탈퇴 성공',
    });
  }
}
