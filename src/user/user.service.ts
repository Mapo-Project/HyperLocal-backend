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
  NeighborhoodChoiceOutputDto,
  NeighborhoodDeleteOutputDto,
  NeighborhoodRegistrationOutputDto,
  NeighborhoodSelectOutputDto,
} from './dto/user.neighborhood.dto';
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
      `SELECT NICKNAME FROM USER WHERE NICKNAME='${nickname}';`,
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
    const { nickname, phoneNum, email } = profileDetailInputDto;

    const conn = getConnection();
    const [found] = await conn.query(
      `SELECT USER_ID FROM USER WHERE USER_ID='${user_id}' AND STATUS='P' AND VERIFY='Y';`,
    );

    if (!found) {
      try {
        await conn.query(
          `UPDATE USER SET NICKNAME='${nickname}', PHONE_NUM='${phoneNum}', EMAIL='${email}', 
           VERIFY='Y', UPDATE_DT=NOW( ), UPDATE_ID='${user_id}'
           WHERE USER_ID='${user_id}' AND STATUS='P';`,
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
      `SELECT NICKNAME AS nickname, EMAIL AS email, PHONE_NUM AS phoneNum, PROFILE_IMG AS profileImg, VERIFY AS verify FROM USER 
       WHERE USER_ID='${user_id}'AND STATUS='P';`,
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
         WHERE USER_ID='${user_id}' AND VERIFY='Y' AND STATUS='P';`,
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
         WHERE USER_ID='${user_id}' AND VERIFY='Y' AND STATUS='P';`,
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

  async userNeighborhoodRegistration(
    user_id: string,
    param: { neighborhood: string },
  ): Promise<NeighborhoodRegistrationOutputDto> {
    const conn = getConnection();

    const sql = `INSERT INTO NEIGHBORHOOD(USER_ID, NGHBR_NAME, INSERT_DT, INSERT_ID)
                 VALUES(?,?,NOW(),?);`;
    const params = [user_id, param.neighborhood, user_id];

    const [found] = await conn.query(`SELECT NGHBR_ID FROM NEIGHBORHOOD 
                                      WHERE USER_ID='${user_id}' AND NGHBR_NAME='${param.neighborhood}' AND USE_YN='Y';`);
    if (found) {
      this.logger.verbose(`User ${user_id} 이미 등록되어 있는 동네`);
      throw new HttpException(
        '이미 등록되어 있는 동네입니다.',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const [count] = await conn.query(
        `SELECT COUNT(*) AS count FROM NEIGHBORHOOD WHERE USER_ID='${user_id}' AND USE_YN='Y';`,
      );
      if (count.count < 3) {
        await conn.query(`UPDATE NEIGHBORHOOD SET SLCTD_NGHBR_YN='N' 
                          WHERE USER_ID='${user_id}' AND USE_YN='Y';`);
        await conn.query(sql, params);
        this.logger.verbose(`User ${user_id} 회원 동네 등록 성공`);
        return {
          statusCode: 201,
          message: '회원 동네 등록 성공',
        };
      }
      throw new HttpException('등록 갯수 초과', HttpStatus.BAD_REQUEST);
    } catch (error) {
      if (error.response === '등록 갯수 초과') {
        this.logger.verbose(`User ${user_id} 회원 동네 등록 갯수 초과`);
        throw new HttpException(
          '회원 동네 등록 갯수 초과',
          HttpStatus.BAD_REQUEST,
        );
      }
      this.logger.verbose(`User ${user_id} 회원 동네 등록 실패\n ${error}`);
      throw new HttpException('회원 동네 등록 실패', HttpStatus.BAD_REQUEST);
    }
  }

  async userNeighborhoodChoice(
    user_id: string,
    param: { selectId: number },
  ): Promise<NeighborhoodChoiceOutputDto> {
    const conn = getConnection();

    try {
      const [found] = await conn.query(`SELECT NGHBR_ID AS id FROM NEIGHBORHOOD 
                          WHERE USER_ID='${user_id}' AND NGHBR_ID='${param.selectId}' AND USE_YN='Y';`);

      if (found) {
        await conn.query(`UPDATE NEIGHBORHOOD SET SLCTD_NGHBR_YN='N', UPDATE_DT=NOW(), UPDATE_ID='${user_id}' 
                          WHERE USER_ID='${user_id}' AND SLCTD_NGHBR_YN='Y' AND USE_YN='Y';`);

        await conn.query(`UPDATE NEIGHBORHOOD SET SLCTD_NGHBR_YN='Y', UPDATE_DT=NOW(), UPDATE_ID='${user_id}' 
                          WHERE USER_ID='${user_id}' AND USE_YN='Y' AND NGHBR_ID=${param.selectId};`);

        this.logger.verbose(`User ${user_id} 회원 동네 선택 성공`);
        return {
          statusCode: 201,
          message: '회원 동네 선택 성공',
        };
      }
      throw new HttpException(
        '유효하지 않는 동네 아이디',
        HttpStatus.BAD_REQUEST,
      );
    } catch (error) {
      if (error.response === '유효하지 않는 동네 아이디') {
        this.logger.verbose(`User ${user_id} 유효하지 않는 동네 아이디 요청`);
        throw new HttpException(
          '유효하지 않는 동네 아이디 요청',
          HttpStatus.BAD_REQUEST,
        );
      }
      this.logger.verbose(`User ${user_id} 회원 동네 선택 실패\n ${error}`);
      throw new HttpException('회원 동네 선택 실패', HttpStatus.BAD_REQUEST);
    }
  }

  async getUserNeighborhood(
    user_id: string,
  ): Promise<NeighborhoodSelectOutputDto> {
    const conn = getConnection();

    try {
      const [count] =
        await conn.query(`SELECT COUNT(*) AS count FROM NEIGHBORHOOD
                          WHERE USER_ID='${user_id}' AND USE_YN='Y';`);
      const found =
        await conn.query(`SELECT NGHBR_ID AS neighborhoodId, NGHBR_NAME AS neighborhoodName, SLCTD_NGHBR_YN AS choiceYN 
                          FROM NEIGHBORHOOD
                          WHERE USER_ID='${user_id}' AND USE_YN='Y';`);

      this.logger.verbose(`User ${user_id} 회원 동네 조회 성공`);
      return {
        statusCode: 200,
        message: '회원 동네 조회 성공',
        count: count.count,
        data: found,
      };
    } catch (error) {
      this.logger.verbose(`User ${user_id} 회원 동네 조회 실패\n ${error}`);
      throw new HttpException('회원 동네 조회 실패', HttpStatus.BAD_REQUEST);
    }
  }

  async userNeighborhoodDelete(
    user_id: string,
    param: { selectId: number },
  ): Promise<NeighborhoodDeleteOutputDto> {
    const conn = getConnection();

    try {
      const [found] =
        await conn.query(`SELECT NGHBR_ID AS id, SLCTD_NGHBR_YN AS choice_id, COUNT(*) AS count FROM NEIGHBORHOOD 
                          WHERE USER_ID='${user_id}' AND NGHBR_ID='${param.selectId}' AND USE_YN='Y';`);

      if (found) {
        if (found.choice_id === 'Y' && found.count > 1) {
          const [neighborhood_id] = await conn.query(`SELECT NGHBR_ID AS id
                                                      FROM NEIGHBORHOOD
                                                      WHERE USER_ID='${user_id}' AND SLCTD_NGHBR_YN='N' AND USE_YN='Y'
                                                      ORDER BY NGHBR_ID DESC
                                                      LIMIT 1`);
          await conn.query(
            `UPDATE NEIGHBORHOOD SET USE_YN='N', UPDATE_DT=NOW(), UPDATE_ID='${user_id}' 
             WHERE NGHBR_ID=${param.selectId};` +
              `UPDATE NEIGHBORHOOD SET SLCTD_NGHBR_YN='Y', UPDATE_DT=NOW(), UPDATE_ID='${user_id}' 
               WHERE NGHBR_ID=${neighborhood_id.id};`,
          );
        } else if (found.choice_id === 'Y' && found.count == 1) {
          await conn.query(
            `UPDATE NEIGHBORHOOD SET USE_YN='N', UPDATE_DT=NOW(), UPDATE_ID='${user_id}' 
             WHERE NGHBR_ID=${param.selectId};`,
          );
        } else {
          await conn.query(`UPDATE NEIGHBORHOOD SET USE_YN='N', UPDATE_DT=NOW(), UPDATE_ID='${user_id}' 
                            WHERE NGHBR_ID=${param.selectId};`);
        }

        this.logger.verbose(`User ${user_id} 회원 동네 삭제 성공`);
        return {
          statusCode: 200,
          message: '회원 동네 삭제 성공',
        };
      }
      throw new HttpException(
        '유효하지 않는 동네 아이디',
        HttpStatus.BAD_REQUEST,
      );
    } catch (error) {
      if (error.response === '유효하지 않는 동네 아이디') {
        this.logger.verbose(`User ${user_id} 유효하지 않는 동네 아이디 요청`);
        throw new HttpException(
          '유효하지 않는 동네 아이디 요청',
          HttpStatus.BAD_REQUEST,
        );
      }
      this.logger.verbose(`User ${user_id} 회원 동네 삭제 실패\n ${error}`);
      throw new HttpException('회원 동네 삭제 실패', HttpStatus.BAD_REQUEST);
    }
  }

  async userLogout(user_id: string): Promise<UserLogoutOutputDto> {
    const conn = getConnection();

    try {
      await conn.query(
        `UPDATE USER SET REFRESH_TOKEN=NULL, UPDATE_DT=NOW(), UPDATE_ID='${user_id}' 
         WHERE USER_ID='${user_id}' AND status='P';`,
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
        `UPDATE USER SET STATUS='D', NICKNAME=NULL, EMAIL=NULL, PHONE_NUM=NULL,
         UPDATE_DT=NOW(), UPDATE_ID='${user_id}', PROFILE_IMG=NULL, REFRESH_TOKEN=NULL 
         WHERE USER_ID='${user_id}' AND STATUS='P';`,
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
