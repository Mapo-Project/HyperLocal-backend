import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { multerOptions } from 'src/user/multerOptions';
import { BoardService } from './board.service';
import { SelectBoardMenuOutputDto } from './dto/board.menu.dto';
import {
  BoardRegisterInputDto,
  BoardRegisterOutputDto,
} from './dto/board.register.dto';

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

  //게시판 등록
  @Post('/register')
  @ApiOperation({ summary: '게시판 등록 API(완료)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: '게시판 등록',
    type: BoardRegisterInputDto,
  })
  @ApiResponse({
    status: 201,
    description: '게시판 등록 성공',
    type: BoardRegisterOutputDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request',
  })
  @ApiResponse({
    status: 401,
    description: '인증 오류',
  })
  @ApiResponse({
    status: 413,
    description: '파일크기 제한',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @UseInterceptors(FilesInterceptor('board', 10, multerOptions))
  async boardRegister(
    @Req() req,
    @UploadedFiles() files: File[],
    @Body(ValidationPipe)
    boardRegisterInputDto: BoardRegisterInputDto,
  ) {
    return await this.boardService.boardRegister(
      req.user,
      boardRegisterInputDto,
      files,
    );
  }
}
