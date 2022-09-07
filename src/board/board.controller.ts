import { Controller, Get } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { BoardService } from './board.service';
import { SelectBoardMenuOutputDto } from './dto/board.menu.dto';

@ApiTags('게시판 API')
@Controller('board')
export class BoardController {
  constructor(private boardService: BoardService) {}

  //게시판 등록 메뉴 조회
  @Get('menu/select')
  @ApiOperation({
    summary: '게시판 등록 메뉴 조회 API(완료)',
    description: '게시판 등록 메뉴 조회 입니다.',
  })
  @ApiOkResponse({
    description: '게시판 등록 메뉴 조회 성공',
    type: SelectBoardMenuOutputDto,
  })
  @ApiResponse({
    status: 400,
    description: '게시판 등록 메뉴 조회 실패',
  })
  async getBoardMenu(): Promise<SelectBoardMenuOutputDto> {
    return await this.boardService.getBoardMenu();
  }
}
