import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { createImageURL } from 'src/user/multerOptions';
import { getConnection } from 'typeorm';
import { SelectBoardMenuOutputDto } from './dto/board.menu.dto';
import {
  BoardRegisterInputDto,
  BoardRegisterOutputDto,
} from './dto/board.register.dto';
import { BoardSelectOutputDto } from './dto/board.select.dto';
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

  private async neighborhood(user_id: string) {
    const conn = getConnection();
    const [found] = await conn.query(`
    SELECT B.NGHBR_NAME AS nghbr_name
    FROM USER A JOIN NEIGHBORHOOD B ON A.USER_ID = B.USER_ID
    WHERE A.USER_ID='${user_id}'
    AND A.STATUS='P' AND B.SLCTD_NGHBR_YN='Y' AND B.USE_YN='Y';`);

    return found.nghbr_name;
  }

  async boardRegister(
    user_id: string,
    boardRegisterInputDto: BoardRegisterInputDto,
    files: File[],
  ): Promise<BoardRegisterOutputDto> {
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
    const arr = [];
    const neighborhood_name = await this.neighborhood(user_id);

    const sql = `INSERT INTO NOTICE_BOARD(NOTICE_ID, USER_ID, NGHBR_NAME, CATEGORY, TITLE, DESCRIPTION, LINK, 
                 CONTAINER_YN, HOMEMADE_YN, PRICE, HOW_SHARE, PERSONNEL, DEADLINE, INSERT_DT, INSERT_ID) 
                 VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,NOW(),?);`;
    const params = [
      notice_id,
      user_id,
      neighborhood_name,
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

    const img_sql = `INSERT INTO NOTICE_BOARD_IMG(NOTICE_ID, USER_ID, NOTICE_IMG, INSERT_DT, INSERT_ID) VALUES ?;`;
    if (files.length) {
      for (const file of files) {
        arr.push([notice_id, user_id, createImageURL(file), date, notice_id]);
      }
    } else {
      const board_img = process.env.BOARD_IMG_DEFAULT;
      arr.push([notice_id, user_id, board_img, date, notice_id]);
    }

    if (personnel < '2') {
      this.logger.verbose(`User ${user_id} 참여 인원은 2명 이상 필요`);
      throw new HttpException(
        '참여 인원은 2명 이상 필요',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      await conn.query(sql, params);

      await conn.query(img_sql, [arr]);

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

  async getNeighborhoodBoard(
    user_id: string,
    page: number,
  ): Promise<BoardSelectOutputDto> {
    const conn = getConnection();
    const neighborhood_name = await this.neighborhood(user_id);
    const page_count = (page - 1) * 10;

    try {
      const board = await conn.query(`
      SELECT A.NOTICE_ID, A.CATEGORY, A.TITLE, A.PRICE, A.PERSONNEL, A.DEADLINE, B.NOTICE_IMG
      FROM NOTICE_BOARD A JOIN 
      (SELECT MIN(NOTICE_IMG_ID) AS NOTICE_IMG_ID, NOTICE_ID, MAX(NOTICE_IMG) AS NOTICE_IMG
      FROM NOTICE_BOARD_IMG
      WHERE USER_ID='${user_id}' AND USE_YN='Y'
      GROUP BY NOTICE_ID) AS B 
      ON A.NOTICE_ID = B.NOTICE_ID
      WHERE A.USER_ID='${user_id}'
      AND A.NGHBR_NAME='${neighborhood_name}' AND A.USE_YN='Y'
      ORDER BY A.INSERT_DT
      LIMIT 10 OFFSET ${page_count};`);

      const [count] = await conn.query(`
        SELECT COUNT(A.NOTICE_ID) AS count
        FROM NOTICE_BOARD A JOIN 
        (SELECT MIN(NOTICE_IMG_ID) AS NOTICE_IMG_ID, NOTICE_ID, MAX(NOTICE_IMG) AS NOTICE_IMG
        FROM NOTICE_BOARD_IMG
        WHERE USER_ID='${user_id}' AND USE_YN='Y'
        GROUP BY NOTICE_ID) AS B 
        ON A.NOTICE_ID = B.NOTICE_ID
        WHERE A.USER_ID='${user_id}'
        AND A.NGHBR_NAME='${neighborhood_name}' AND A.USE_YN='Y';`);

      if (board.length) {
        this.logger.verbose(`User ${user_id} 게시판 조회 성공`);
        return {
          statusCode: 200,
          message: '게시판 조회 성공',
          count: count.count,
          data: board,
        };
      } else {
        throw new HttpException(
          '게시판 페이지 넘버 초과',
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (error) {
      if (error.response === '게시판 페이지 넘버 초과') {
        this.logger.verbose(`User ${user_id} 게시판 페이지 넘버 초과`);
        throw new HttpException(
          '게시판 페이지 넘버 초과',
          HttpStatus.BAD_REQUEST,
        );
      }
      this.logger.error(`User ${user_id} 게시판 조회 실패
        Error: ${error}`);
      throw new HttpException('게시판 조회 실패', HttpStatus.BAD_REQUEST);
    }
  }

  async getCategoryBoard(
    user_id: string,
    page: number,
    category: string,
  ): Promise<BoardSelectOutputDto> {
    const conn = getConnection();
    const neighborhood_name = await this.neighborhood(user_id);
    const page_count = (page - 1) * 10;

    try {
      const board = await conn.query(`
      SELECT A.NOTICE_ID, A.CATEGORY, A.TITLE, A.PRICE, A.PERSONNEL, A.DEADLINE, B.NOTICE_IMG
      FROM NOTICE_BOARD A JOIN
      (SELECT MIN(NOTICE_IMG_ID) AS NOTICE_IMG_ID, NOTICE_ID, MAX(NOTICE_IMG) AS NOTICE_IMG
      FROM NOTICE_BOARD_IMG
      WHERE USER_ID='${user_id}' AND USE_YN='Y'
      GROUP BY NOTICE_ID) AS B
      ON A.NOTICE_ID = B.NOTICE_ID
      WHERE A.USER_ID='${user_id}'
      AND A.NGHBR_NAME='${neighborhood_name}' 
      AND A.CATEGORY='${category}' AND A.USE_YN='Y'
      ORDER BY A.INSERT_DT
      LIMIT 10 OFFSET ${page_count};`);

      const [count] = await conn.query(`
        SELECT COUNT(A.NOTICE_ID) AS count
        FROM NOTICE_BOARD A JOIN
        (SELECT MIN(NOTICE_IMG_ID) AS NOTICE_IMG_ID, NOTICE_ID, MAX(NOTICE_IMG) AS NOTICE_IMG
        FROM NOTICE_BOARD_IMG
        WHERE USER_ID='${user_id}' AND USE_YN='Y'
        GROUP BY NOTICE_ID) AS B
        ON A.NOTICE_ID = B.NOTICE_ID
        WHERE A.USER_ID='${user_id}'
        AND A.NGHBR_NAME='${neighborhood_name}' 
        AND A.CATEGORY='${category}' AND A.USE_YN='Y';`);

      if (board.length) {
        this.logger.verbose(`User ${user_id} 게시판 조회 성공`);
        return {
          statusCode: 200,
          message: '게시판 조회 성공',
          count: count.count,
          data: board,
        };
      } else if (page_count === 0) {
        this.logger.verbose(`User ${user_id} 게시판 조회 성공`);
        return {
          statusCode: 200,
          message: '게시판 조회 성공',
          count: count.count,
          data: board,
        };
      } else {
        throw new HttpException(
          '게시판 페이지 넘버 초과',
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (error) {
      if (error.response === '게시판 페이지 넘버 초과') {
        this.logger.verbose(`User ${user_id} 게시판 페이지 넘버 초과`);
        throw new HttpException(
          '게시판 페이지 넘버 초과',
          HttpStatus.BAD_REQUEST,
        );
      }
      this.logger.error(`User ${user_id} 게시판 조회 실패
        Error: ${error}`);
      throw new HttpException('게시판 조회 실패', HttpStatus.BAD_REQUEST);
    }
  }

  async getTitleBoard(
    user_id: string,
    page: number,
    title: string,
  ): Promise<BoardSelectOutputDto> {
    const conn = getConnection();
    const neighborhood_name = await this.neighborhood(user_id);
    const page_count = (page - 1) * 10;

    try {
      const board = await conn.query(`
      SELECT A.NOTICE_ID, A.CATEGORY, A.TITLE, A.PRICE, A.PERSONNEL, A.DEADLINE, B.NOTICE_IMG
      FROM NOTICE_BOARD A JOIN
      (SELECT MIN(NOTICE_IMG_ID) AS NOTICE_IMG_ID, NOTICE_ID, MAX(NOTICE_IMG) AS NOTICE_IMG
      FROM NOTICE_BOARD_IMG
      WHERE USER_ID='${user_id}' AND USE_YN='Y'
      GROUP BY NOTICE_ID) AS B
      ON A.NOTICE_ID = B.NOTICE_ID
      WHERE A.USER_ID='${user_id}'
      AND A.NGHBR_NAME='${neighborhood_name}' 
      AND TITLE LIKE '%${title}%' AND A.USE_YN='Y'
      ORDER BY A.INSERT_DT
      LIMIT 10 OFFSET ${page_count};`);

      const [count] = await conn.query(`
        SELECT COUNT(A.NOTICE_ID) AS count
        FROM NOTICE_BOARD A JOIN
        (SELECT MIN(NOTICE_IMG_ID) AS NOTICE_IMG_ID, NOTICE_ID, MAX(NOTICE_IMG) AS NOTICE_IMG
        FROM NOTICE_BOARD_IMG
        WHERE USER_ID='${user_id}' AND USE_YN='Y'
        GROUP BY NOTICE_ID) AS B
        ON A.NOTICE_ID = B.NOTICE_ID
        WHERE A.USER_ID='${user_id}'
        AND A.NGHBR_NAME='${neighborhood_name}' 
        AND TITLE LIKE '%${title}%' AND A.USE_YN='Y';`);

      if (board.length) {
        this.logger.verbose(`User ${user_id} 게시판 조회 성공`);
        return {
          statusCode: 200,
          message: '게시판 조회 성공',
          count: count.count,
          data: board,
        };
      } else if (page_count === 0) {
        this.logger.verbose(`User ${user_id} 게시판 조회 성공`);
        return {
          statusCode: 200,
          message: '게시판 조회 성공',
          count: count.count,
          data: board,
        };
      } else {
        throw new HttpException(
          '게시판 페이지 넘버 초과',
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (error) {
      if (error.response === '게시판 페이지 넘버 초과') {
        this.logger.verbose(`User ${user_id} 게시판 페이지 넘버 초과`);
        throw new HttpException(
          '게시판 페이지 넘버 초과',
          HttpStatus.BAD_REQUEST,
        );
      }
      this.logger.error(`User ${user_id} 게시판 조회 실패
        Error: ${error}`);
      throw new HttpException('게시판 조회 실패', HttpStatus.BAD_REQUEST);
    }
  }
}
