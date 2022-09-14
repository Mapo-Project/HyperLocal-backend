import {
  Body,
  Controller,
  Get,
  Param,
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
  ApiParam,
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
import { BoardSelectOutputDto } from './dto/board.select.dto';

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
  @Post('register')
  @ApiOperation({
    summary: '게시판 등록 API(완료)',
    description: '게시판 등록 입니다. 토큰 값 필수!',
  })
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
  ): Promise<BoardRegisterOutputDto> {
    return await this.boardService.boardRegister(
      req.user,
      boardRegisterInputDto,
      files,
    );
  }

  //게시판 조회(동네)
  @Get('neighborhood/select/:page')
  @ApiOperation({
    summary: '게시판 조회(동네)(검색-10개) API(완료)',
    description: '게시판 조회(동네) 입니다. 토큰 값 필수!',
  })
  @ApiParam({
    name: 'page',
    example: 1,
    description: '게시판 페이지 넘버',
  })
  @ApiOkResponse({
    description: '게시판 조회 성공',
    type: BoardSelectOutputDto,
  })
  @ApiResponse({
    status: 400,
    description: '게시판 조회 실패',
  })
  @ApiResponse({
    status: 401,
    description: '인증 오류',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  async getNeighborhoodBoard(
    @Req() req,
    @Param() param: { page: number },
  ): Promise<BoardSelectOutputDto> {
    return await this.boardService.getNeighborhoodBoard(req.user, param.page);
  }

  //게시판 조회(카테고리)
  @Get('category/select/:page/:category')
  @ApiOperation({
    summary: '게시판 조회(카테고리)(검색-10개) API(완료)',
    description: '게시판 조회(카테고리) 입니다. 토큰 값 필수!',
  })
  @ApiParam({
    name: 'page',
    example: 1,
    description: '게시판 페이지 넘버',
  })
  @ApiParam({
    name: 'category',
    example: '100',
    description: '카테고리(공통코드)',
  })
  @ApiOkResponse({
    description: '게시판 조회 성공',
    type: BoardSelectOutputDto,
  })
  @ApiResponse({
    status: 400,
    description: '게시판 조회 실패',
  })
  @ApiResponse({
    status: 401,
    description: '인증 오류',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  async getCategoryBoard(
    @Req() req,
    @Param() param: { page: number; category: string },
  ): Promise<BoardSelectOutputDto> {
    return await this.boardService.getCategoryBoard(
      req.user,
      param.page,
      param.category,
    );
  }

  //게시판 조회(제목)
  @Get('title/select/:page/:title')
  @ApiOperation({
    summary: '게시판 조회(제목)(검색-10개) API(완료)',
    description: '게시판 조회(제목) 입니다. 토큰 값 필수!',
  })
  @ApiParam({
    name: 'page',
    example: 1,
    description: '게시판 페이지 넘버',
  })
  @ApiParam({
    name: 'title',
    example: '카페',
    description: '검색 할 단어',
  })
  @ApiOkResponse({
    description: '게시판 조회 성공',
    type: BoardSelectOutputDto,
  })
  @ApiResponse({
    status: 400,
    description: '게시판 조회 실패',
  })
  @ApiResponse({
    status: 401,
    description: '인증 오류',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  async getTitleBoard(
    @Req() req,
    @Param() param: { page: number; title: string },
  ): Promise<BoardSelectOutputDto> {
    return await this.boardService.getTitleBoard(
      req.user,
      param.page,
      param.title,
    );
  }
}
