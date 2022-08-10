import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { getConnection } from 'typeorm';
import {
  NickNameDuplicateInputDto,
  NickNameDuplicateOutputDto,
} from './dto/user.duplicate.dto';
import { UserLogoutOutputDto } from './dto/user.logout.dto';
import {
  ModifyProfileDetailInputDto,
  ModifyProfileDetailOutputDto,
  ModifyProfileImgOutputDto,
  ProfileDetailInputDto,
  ProfileDetailOutputDto,
  SelectProfileOutputDto,
} from './dto/user.profile.dto';
import { UserWithdrawalOutputDto } from './dto/user.withdrawal.dto';
import { createImageURL } from './multerOptions';

@Injectable()
export class UserService {
  private logger = new Logger('UserService');

  async nickNameDuplicate(
    nickNameDuplicateInputDto: NickNameDuplicateInputDto,
  ): Promise<NickNameDuplicateOutputDto> {
    const { nickname } = nickNameDuplicateInputDto;

    const conn = getConnection();
    const [found] = await conn.query(
      `SELECT NICKNAME FROM USER WHERE NICKNAME='${nickname}'`,
    );

    this.logger.verbose(`Nickname: ${nickname} 중복체크`);
    return found
      ? {
          statusCode: 200,
          message: '닉네임 중복체크 조회 성공',
          duplicate: 'duplicate',
        }
      : {
          statusCode: 200,
          message: '닉네임 중복체크 조회 성공',
          duplicate: 'unDuplicate',
        };
  }

  async addUserProfile(
    user_id: string,
    profileDetailInputDto: ProfileDetailInputDto,
  ): Promise<ProfileDetailOutputDto> {
    const { nickname, phone_num, email } = profileDetailInputDto;

    const conn = getConnection();
    const [found] = await conn.query(
      `SELECT USER_ID FROM USER WHERE USER_ID='${user_id}' AND STATUS='P' AND VERIFY='Y'`,
    );

    if (!found) {
      try {
        await conn.query(
          `UPDATE USER SET NICKNAME='${nickname}', PHONE_NUM='${phone_num}', EMAIL='${email}', 
           VERIFY='Y', UPDATE_DT=NOW( ), UPDATE_ID='${user_id}'
           WHERE USER_ID='${user_id}' AND STATUS='P'`,
        );
        this.logger.verbose(`User ${user_id} 회원 프로필 추가정보 등록 성공`);
        return {
          statusCode: 201,
          message: '회원 프로필 추가정보 등록 성공',
        };
      } catch (error) {
        this.logger.error(`회원 프로필 추가정보 등록 실패
        Error: ${error}`);
        if (error.code === 'ER_DUP_ENTRY') {
          throw new ConflictException(`${error.sqlMessage}`);
        } else {
          throw new InternalServerErrorException();
        }
      }
    } else {
      this.logger.verbose(`User ${user_id} 회원 프로필 추가정보 등록 실패`);
      throw new HttpException(
        '회원 프로필 추가정보가 등록된 회원 입니다.',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getUserProfile(user_id: string): Promise<SelectProfileOutputDto> {
    const conn = getConnection();
    const [user] = await conn.query(
      `SELECT NICKNAME AS nickname, EMAIL AS email, PROFILE_IMG AS profile_img, VERIFY AS verify FROM USER 
       WHERE USER_ID='${user_id}'AND STATUS='P'`,
    );
    if (user) {
      if (user.verify === 'Y') {
        delete user.verify;

        this.logger.verbose(`User ${user_id} 회원 프로필 조회 성공`);
        return {
          statusCode: 200,
          message: '회원 프로필 조회 성공',
          data: user,
        };
      }
      this.logger.verbose(`User ${user_id} 회원 프로필 조회 실패`);
      throw new HttpException(
        '회원 프로필 추가정보가 등록되지 않은 회원 입니다.',
        HttpStatus.NOT_FOUND,
      );
    } else {
      this.logger.verbose(`User ${user_id} 회원 프로필 조회 실패`);
      throw new HttpException('회원 프로필 조회 실패', HttpStatus.BAD_REQUEST);
    }
  }

  async modifyUserProfile(
    user_id: string,
    modifyProfileDetailInputDto: ModifyProfileDetailInputDto,
  ): Promise<ModifyProfileDetailOutputDto> {
    const { nickname, email } = modifyProfileDetailInputDto;
    const conn = getConnection();

    try {
      await conn.query(
        `UPDATE USER SET NICKNAME='${nickname}', EMAIL='${email}', UPDATE_DT=NOW(), UPDATE_ID='${user_id}'
         WHERE USER_ID='${user_id}' AND VERIFY='Y' AND STATUS='P' `,
      );

      this.logger.verbose(`User ${user_id} 회원 프로필 수정 성공`);
      return {
        statusCode: 201,
        message: '회원 프로필 수정 성공',
      };
    } catch (error) {
      this.logger.error(`회원 프로필 추가정보 수정 실패
      Error: ${error}`);
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException(`${error.sqlMessage}`);
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async modifyUserProfileImg(
    user_id: string,
    file: string,
  ): Promise<ModifyProfileImgOutputDto> {
    if (file) {
      const generatedFile = createImageURL(file);
      const conn = getConnection();

      await conn.query(
        `UPDATE USER SET PROFILE_IMG='${generatedFile}', UPDATE_DT=NOW(), UPDATE_ID='${user_id}'
          WHERE USER_ID='${user_id}' AND VERIFY='Y' AND STATUS='P' `,
      );

      this.logger.verbose(`User ${user_id} 회원 프로필 이미지 수정 성공`);
      return Object.assign({
        statusCode: 201,
        message: '회원 프로필 이미지 수정 성공',
      });
    }

    this.logger.verbose(`User ${user_id} 회원 프로필 이미지 수정 실패`);
    throw new HttpException(
      '회원 프로필 이미지 수정 실패',
      HttpStatus.BAD_REQUEST,
    );
  }

  async userLogout(user_id: string): Promise<UserLogoutOutputDto> {
    const conn = getConnection();

    try {
      await conn.query(
        `UPDATE USER SET REFRESH_TOKEN=NULL, UPDATE_DT=NOW(), UPDATE_ID='${user_id}' 
         WHERE USER_ID='${user_id}' AND status='P'`,
      );

      this.logger.verbose(`User ${user_id} 회원 로그아웃 성공`);
      return {
        statusCode: 200,
        message: '회원 로그아웃 성공',
      };
    } catch (error) {
      this.logger.verbose(`User ${user_id} 회원 로그아웃 실패\n ${error}`);
      throw new HttpException('회원 로그아웃 실패', HttpStatus.BAD_REQUEST);
    }
  }

  async userWithdrawal(user_id: string): Promise<UserWithdrawalOutputDto> {
    const conn = getConnection();

    try {
      await conn.query(
        `UPDATE USER SET STATUS='D', NICKNAME=NULL, EMAIL=NULL, 
         UPDATE_DT=NOW(), UPDATE_ID='${user_id}', PROFILE_IMG=NULL, REFRESH_TOKEN=NULL 
         WHERE USER_ID='${user_id}' AND STATUS='P'`,
      );

      this.logger.verbose(`User ${user_id} 회원 탈퇴 성공`);
      return {
        statusCode: 200,
        message: '회원 탈퇴 성공',
      };
    } catch (error) {
      this.logger.verbose(`User ${user_id} 회원 탈퇴 실패\n ${error}`);
      throw new HttpException('회원 탈퇴 실패', HttpStatus.BAD_REQUEST);
    }
  }
}
