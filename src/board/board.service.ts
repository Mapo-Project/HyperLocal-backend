import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { getConnection } from 'typeorm';
import { SelectBoardMenuOutputDto } from './dto/board.menu.dto';

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
}
