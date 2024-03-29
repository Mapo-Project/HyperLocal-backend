import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
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
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
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
import { multerOptions } from './multerOptions';
import { UserService } from './user.service';

@ApiTags('유저 API')
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  //회원 닉네임 중복체크
  @Get('duplicate/nickname/:nickname')
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
    @Param(ValidationPipe) nickNameDuplicateInputDto: NickNameDuplicateInputDto,
  ): Promise<NickNameDuplicateOutputDto> {
    return await this.userService.nickNameDuplicate(nickNameDuplicateInputDto);
  }

  //회원 프로필 추가
  @Post('profile/add')
  @ApiOperation({
    summary: '회원 프로필 추가 API(1차 완료)',
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
    description: '회원 프로필 추가정보가 등록된 회원 입니다.',
  })
  @ApiResponse({
    status: 401,
    description: '인증 오류',
  })
  @ApiResponse({
    status: 409,
    description: '중복된 entry가 존재합니다.',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  async addUserProfile(
    @Req() req,
    @Body(ValidationPipe) profileDetailInputDto: ProfileDetailInputDto,
  ): Promise<ProfileDetailOutputDto> {
    return await this.userService.addUserProfile(
      req.user,
      profileDetailInputDto,
    );
  }

  //회원 프로필 조회
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
  @ApiResponse({
    status: 404,
    description: '회원 프로필 추가정보가 등록되지 않은 회원 입니다.',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  async getUserProfile(@Req() req): Promise<SelectProfileOutputDto> {
    return await this.userService.getUserProfile(req.user);
  }

  //회원 프로필 수정
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
  @ApiResponse({
    status: 409,
    description: '중복된 entry가 존재합니다.',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  async modifyUserProfile(
    @Req() req,
    @Body(ValidationPipe)
    modifyProfileDetailInputDto: ModifyProfileDetailInputDto,
  ): Promise<ModifyProfileDetailOutputDto> {
    return await this.userService.modifyUserProfile(
      req.user,
      modifyProfileDetailInputDto,
    );
  }

  //회원 프로필 이미지 수정
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
  async modifyUserProfileImg(
    @Req() req,
    @UploadedFile() file: string,
  ): Promise<ModifyProfileImgOutputDto> {
    return await this.userService.modifyUserProfileImg(req.user, file);
  }

  //회원 동네 등록
  @Post('neighborhood/registration/:neighborhood')
  @ApiOperation({
    summary: '회원 동네 등록 API(완료)',
    description: '회원 동네 등록 입니다. 토큰 값 필수!',
  })
  @ApiParam({
    name: 'neighborhood',
    example: '성산동',
    description: '등록할 동네 주소',
  })
  @ApiResponse({
    status: 201,
    description: '회원 동네 등록 성공',
    type: NeighborhoodRegistrationOutputDto,
  })
  @ApiResponse({
    status: 400,
    description:
      '회원 동네 등록 실패 || 이미 등록되어 있는 동네 || 회원 동네 등록 갯수 초과',
  })
  @ApiResponse({
    status: 401,
    description: '인증 오류',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  async userNeighborhoodRegistration(
    @Req() req,
    @Param() param: { neighborhood: string },
  ): Promise<NeighborhoodRegistrationOutputDto> {
    return await this.userService.userNeighborhoodRegistration(req.user, param);
  }

  //회원 동네 선택
  @Post('neighborhood/choice/:selectId')
  @ApiOperation({
    summary: '회원 동네 선택 API(완료)',
    description: '회원 동네 선택 입니다. 토큰 값 필수!',
  })
  @ApiParam({
    name: 'selectId',
    example: 1,
    description: '선택할 동네 아이디',
  })
  @ApiResponse({
    status: 201,
    description: '회원 동네 선택 성공',
    type: NeighborhoodChoiceOutputDto,
  })
  @ApiResponse({
    status: 400,
    description: '회원 동네 선택 실패 || 유효하지 않는 동네 아이디',
  })
  @ApiResponse({
    status: 401,
    description: '인증 오류',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  async userNeighborhoodChoice(
    @Req() req,
    @Param() param: { selectId: number },
  ): Promise<NeighborhoodChoiceOutputDto> {
    return await this.userService.userNeighborhoodChoice(req.user, param);
  }

  //회원 동네 조회
  @Get('neighborhood/select')
  @ApiOperation({
    summary: '회원 동네 조회 API(완료)',
    description: '회원 동네 조회 입니다. 토큰 값 필수!',
  })
  @ApiOkResponse({
    description: '회원 동네 조회 성공',
    type: NeighborhoodSelectOutputDto,
  })
  @ApiResponse({
    status: 400,
    description: '회원 동네 조회 실패',
  })
  @ApiResponse({
    status: 401,
    description: '인증 오류',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  async getUserNeighborhood(@Req() req): Promise<NeighborhoodSelectOutputDto> {
    return await this.userService.getUserNeighborhood(req.user);
  }

  //회원 동네 삭제
  @Delete('neighborhood/:selectId')
  @ApiOperation({
    summary: '회원 동네 삭제 API(완료)',
    description: '회원 동네 삭제 입니다. 토큰 값 필수!',
  })
  @ApiParam({
    name: 'selectId',
    example: 1,
    description: '삭제할 동네 아이디',
  })
  @ApiOkResponse({
    description: '회원 동네 삭제 성공',
    type: NeighborhoodDeleteOutputDto,
  })
  @ApiResponse({
    status: 400,
    description: '회원 동네 삭제 실패 || 유효하지 않는 동네 아이디',
  })
  @ApiResponse({
    status: 401,
    description: '인증 오류',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  async userNeighborhoodDelete(
    @Req() req,
    @Param() param: { selectId: number },
  ): Promise<NeighborhoodDeleteOutputDto> {
    return await this.userService.userNeighborhoodDelete(req.user, param);
  }

  //회원 로그아웃
  @Get('logout')
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
  async userLogout(@Req() req): Promise<UserLogoutOutputDto> {
    return await this.userService.userLogout(req.user);
  }

  //회원 탈퇴
  @Delete('withdrawal')
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
  async userWithdrawal(@Req() req): Promise<UserWithdrawalOutputDto> {
    return await this.userService.userWithdrawal(req.user);
  }
}
