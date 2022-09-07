import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { createImageURL } from 'src/user/multerOptions';
import { getConnection } from 'typeorm';
import { SelectBoardMenuOutputDto } from './dto/board.menu.dto';
import { BoardRegisterInputDto } from './dto/board.register.dto';
import uuidRandom from './uuidRandom';

@Injectable()
export class BoardService {
  private logger = new Logger('BoardService');

  async getBoardMenu(): Promise<SelectBoardMenuOutputDto> {
    const conn = getConnection();

    try {
      const category = await conn.query(`
      SELECT CODE AS code, CODE_NM AS codeName 
      FROM COM_DETAIL_CODE
      WHERE CODE_ID = 'category' AND USE_YN ='Y';`);

      const how_share = await conn.query(`
      SELECT CODE AS code, CODE_NM AS codeName
      FROM COM_DETAIL_CODE
      WHERE CODE_ID = 'how_share' AND USE_YN ='Y';`);

      this.logger.verbose(`게시판 등록 메뉴 조회 성공`);
      return {
        statusCode: 200,
        message: '게시판 등록 메뉴 조회 성공',
        data: {
          category: category,
          howShare: how_share,
        },
      };
    } catch (error) {
      this.logger.error(`게시판 등록 메뉴 조회 실패
        Error: ${error}`);
      throw new HttpException(
        '게시판 등록 메뉴 조회 실패',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async boardRegister(
    user_id: string,
    boardRegisterInputDto: BoardRegisterInputDto,
    files: File[],
  ) {
    const notice_id = uuidRandom();
    const {
      category,
      title,
      description,
      link,
      container_yn,
      homemade_yn,
      price,
      how_share,
      personnel,
      deadline,
    } = boardRegisterInputDto;
    const conn = getConnection();
    const date = new Date();

    const sql = `INSERT INTO NOTICE_BOARD(NOTICE_ID, USER_ID, CATEGORY, TITLE, DESCRIPTION, LINK, 
                 CONTAINER_YN, HOMEMADE_YN, PRICE, HOW_SHARE, PERSONNEL, DEADLINE, INSERT_DT, INSERT_ID) 
                 VALUES(?,?,?,?,?,?,?,?,?,?,?,?,NOW(),?);`;
    const params = [
      notice_id,
      user_id,
      category,
      title,
      description,
      link,
      container_yn,
      homemade_yn,
      price,
      how_share,
      personnel,
      deadline,
      user_id,
    ];

    if (personnel < '2') {
      this.logger.verbose(`User ${user_id} 참여 인원은 2명 이상 필요`);
      throw new HttpException(
        '참여 인원은 2명 이상 필요',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      if (files.length) {
        const arr = [];
        for (const file of files) {
          arr.push([notice_id, createImageURL(file), date, notice_id]);
        }
        const img_sql = `INSERT INTO NOTICE_BOARD_IMG(NOTICE_ID, NOTICE_IMG, INSERT_DT, INSERT_ID) VALUES ?;`;
        await conn.query(img_sql, [arr]);
      }
      await conn.query(sql, params);

      this.logger.verbose(`User ${user_id} 게시판 등록 성공`);
      return {
        statusCode: 201,
        message: '게시판 등록 성공',
      };
    } catch (error) {
      this.logger.verbose(`User ${user_id} 게시판 등록 성공 실패\n ${error}`);
      throw new HttpException('게시판 등록 성공 실패', HttpStatus.BAD_REQUEST);
    }
  }
}
