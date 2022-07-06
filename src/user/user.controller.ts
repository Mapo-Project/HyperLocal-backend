import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
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
import { multerOptions } from './multerOptions';
import { UserService } from './user.service';

@ApiTags('유저 API')
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('duplicate/nickname')
  @ApiOperation({
    summary: '회원 닉네임 중복체크 API(완료)',
    description: '회원 닉네임 입력',
  })
  @ApiOkResponse({
    description: '닉네임 중복체크 조회 성공',
    type: NickNameDuplicateOutputDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request(nickname should not be empty)',
  })
  async nickNameDuplicate(
    @Query(ValidationPipe) nickNameDuplicateInputDto: NickNameDuplicateInputDto,
  ) {
    return await this.userService.nickNameDuplicate(nickNameDuplicateInputDto);
  }

  @Post('profile/add')
  @ApiOperation({
    summary: '회원 프로필 추가 API(1차 완료/ 데이터 추가 예정)',
    description: '회원 프로필 추가정보 입력 입니다. 토큰 값 필수!',
  })
  @ApiBody({
    description: '추가할 프로필 정보',
    type: ProfileDetailInputDto,
  })
  @ApiResponse({
    status: 201,
    description: '회원 프로필 추가정보 등록 성공',
    type: ProfileDetailOutputDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request(nickname should not be empty)',
  })
  @ApiResponse({
    status: 401,
    description: '인증 오류',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  async addUserProfile(
    @Req() req,
    @Body(ValidationPipe) profileDetailInputDto: ProfileDetailInputDto,
  ) {
    return await this.userService.addUserProfile(
      req.user,
      profileDetailInputDto,
    );
  }

  @Get('profile/select')
  @ApiOperation({
    summary: '회원 프로필 조회 API(1차 완료)',
    description: '회원 프로필 조회 입니다. 토큰 값 필수!',
  })
  @ApiOkResponse({
    description: '회원 프로필 조회 성공',
    type: SelectProfileOutputDto,
  })
  @ApiResponse({
    status: 400,
    description: '회원 프로필 조회 실패',
  })
  @ApiResponse({
    status: 401,
    description: '인증 오류',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  async getUserProfile(@Req() req) {
    return await this.userService.getUserProfile(req.user);
  }

  @Post('profile/modify')
  @ApiOperation({
    summary: '회원 프로필 수정 API(1차 완료)',
    description: '회원 프로필 수정 입니다. 토큰 값 필수!',
  })
  @ApiBody({
    description: '수정할 프로필 정보',
    type: ModifyProfileDetailInputDto,
  })
  @ApiResponse({
    status: 201,
    description: '회원 프로필 수정 성공',
    type: ModifyProfileDetailOutputDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request(should not be empty)',
  })
  @ApiResponse({
    status: 401,
    description: '인증 오류',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  async modifyUserProfile(
    @Req() req,
    @Body(ValidationPipe)
    modifyProfileDetailInputDto: ModifyProfileDetailInputDto,
  ) {
    return await this.userService.modifyUserProfile(
      req.user,
      modifyProfileDetailInputDto,
    );
  }

  @Post('profile/modify/img')
  @ApiOperation({
    summary: '회원 프로필 이미지 수정 API(완료)',
    description: '회원 프로필 이미지 수정 입니다. 토큰 값 필수!',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: '등록 할 이미지 파일',
    schema: {
      type: 'object',
      properties: {
        profile: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: '회원 프로필 이미지 수정 성공',
    type: ModifyProfileImgOutputDto,
  })
  @ApiResponse({
    status: 400,
    description: '회원 프로필 이미지 수정 실패',
  })
  @ApiResponse({
    status: 401,
    description: '인증 오류',
  })
  @ApiResponse({
    status: 404,
    description: '지원하지 않는 이미지 형식',
  })
  @ApiResponse({
    status: 413,
    description: '파일크기 제한',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @UseInterceptors(FileInterceptor('profile', multerOptions))
  async modifyUserProfileImg(@Req() req, @UploadedFile() file: string) {
    return await this.userService.modifyUserProfileImg(req.user, file);
  }

  @Get('/logout')
  @ApiOperation({
    summary: '회원 로그아웃 API(완료)',
    description: '회원 로그아웃 입니다. 토큰 값 필수!',
  })
  @ApiOkResponse({
    description: '회원 로그아웃 성공',
    type: UserLogoutOutputDto,
  })
  @ApiResponse({
    status: 401,
    description: '인증 오류',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  async userLogout(@Req() req) {
    return await this.userService.userLogout(req.user);
  }

  @Delete('/withdrawal')
  @ApiOperation({
    summary: '회원 탈퇴 API(완료)',
    description: '회원 탈퇴 입니다. 토큰 값 필수!',
  })
  @ApiOkResponse({
    description: '회원 탈퇴 성공',
    type: UserWithdrawalOutputDto,
  })
  @ApiResponse({
    status: 401,
    description: '인증 오류',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  async userWithdrawal(@Req() req) {
    return await this.userService.userWithdrawal(req.user);
  }
}
