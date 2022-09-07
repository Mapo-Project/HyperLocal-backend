import {
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  Req,
  Res,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  AccessTokenReissuanceInputDto,
  AccessTokenReissuanceOutputDto,
} from './dto/acess.token.dto';
import { UserDto, UserSocialLoginOutputDto } from './dto/user.dto';

@ApiTags('인증 API')
@Controller('auth')
export class AuthController {
  private logger = new Logger('AuthController');
  constructor(private authService: AuthService) {}

  @Get('login')
  @ApiOperation({
    summary: '로그인 페이지(테스트용)',
  })
  @Header('Content-Type', 'text/html')
  getLoginPage(): string {
    return `
      <div>
        <h1>카카오 로그인</h1>

        <form action="kakao" method="GET">
          <input type="submit" value="카카오로그인" />
        </form>

        <h1>네이버 로그인</h1>

        <form action="naver" method="GET">
          <input type="submit" value="네이버로그인" />
        </form>
      </div>
    `;
  }

  @Get('kakao')
  @ApiOperation({
    summary: '카카오 로그인(완료)',
    description: `카카오 로그인 페이지로 이동 합니다.`,
  })
  @HttpCode(200)
  @UseGuards(AuthGuard('kakao'))
  async kakaoAuth() {
    return HttpStatus.OK;
  }

  @Get('kakao/callback')
  @ApiOperation({
    summary: '카카오 로그인 콜백(완료)',
    description: '카카오 로그인시 콜백 라우터입니다.',
  })
  @UseGuards(AuthGuard('kakao'))
  async kakaoCallBack(
    @Req() req,
    @Res() res,
  ): Promise<UserSocialLoginOutputDto> {
    const user = await this.authService.loginCallBack(req.user as UserDto);
    this.logger.verbose(`User ${req.user.social_id} 카카오 로그인 성공
    Payload: ${JSON.stringify(user)}`);

    return res.redirect(
      `${process.env.FRONT_URL}?user=${JSON.stringify(user)}`,
    );
  }

  @Get('naver')
  @ApiOperation({
    summary: '네이버 로그인(완료)',
    description: `네이버 로그인 페이지로 이동 합니다.`,
  })
  @HttpCode(200)
  @UseGuards(AuthGuard('naver'))
  async naverAuth() {
    return HttpStatus.OK;
  }

  @Get('naver/callback')
  @ApiOperation({
    summary: '네이버 로그인 콜백(완료)',
    description: '네이버 로그인시 콜백 라우터입니다.',
  })
  @UseGuards(AuthGuard('naver'))
  async naverCallBack(
    @Req() req,
    @Res() res,
  ): Promise<UserSocialLoginOutputDto> {
    const user = await this.authService.loginCallBack(req.user as UserDto);
    this.logger.verbose(`User ${req.user.social_id} 네이버 로그인 성공
    Payload: ${JSON.stringify(user)}`);

    return res.redirect(
      `${process.env.FRONT_URL}?user=${JSON.stringify(user)}`,
    );
  }

  @Post('token/reissuance')
  @ApiBody({
    type: AccessTokenReissuanceInputDto,
    description: '리프레시 토큰 값',
  })
  @ApiOperation({
    summary: 'accessToken 재발급 API(완료)',
    description: 'accessToken 재발급 요청',
  })
  @ApiOkResponse({
    description: 'accessToken 재발급 성공',
    type: AccessTokenReissuanceOutputDto,
  })
  @ApiResponse({
    status: 400,
    description: 'accessToken 재발급 실패',
  })
  async accessTokenReissuance(
    @Body(ValidationPipe)
    accessTokenReissuanceInputDto: AccessTokenReissuanceInputDto,
  ): Promise<AccessTokenReissuanceOutputDto> {
    return await this.authService.accessTokenReissuance(
      accessTokenReissuanceInputDto,
    );
  }
}
