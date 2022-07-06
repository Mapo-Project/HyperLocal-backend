import {
  Controller,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Logger,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AccessTokenReissuanceOutputDto } from './dto/acess.token.dto';
import { UserDto } from './dto/user.dto';

@ApiTags('인증 API')
@Controller('auth')
export class AuthController {
  private logger = new Logger('AuthController');
  constructor(private authService: AuthService) {}

  @Get('login')
  @ApiOperation({
    summary: '로그인 페이지(테스트용)',
    description: `카카오 로그인 페이지 주소 입니다.  
    
    http://172.30.1.53:3000/oauth/kakao/callback`,
  })
  @Header('Content-Type', 'text/html')
  getKakaoLoginPage(): string {
    return `
      <div>
        <h1>카카오 로그인</h1>

        <form action="kakao" method="GET">
          <input type="submit" value="카카오로그인" />
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
  async kakaoCallBack(@Req() req, @Res() res) {
    const user = await this.authService.loginCallBack(req.user as UserDto);
    this.logger.verbose(`User ${req.user.user_id} 카카오 로그인 성공
    Payload: ${JSON.stringify(user)}`);

    return res.redirect(
      `${process.env.FRONT_URL}?user=${JSON.stringify(user)}`,
    );
  }

  @Get('token/reissuance')
  @ApiQuery({
    name: 'refreshToken',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiMjMwNDcwNj',
    description: 'refreshToken 값',
  })
  @ApiOperation({
    summary: 'accessToken 재발급(완료)',
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
  async accessTokenReissuance(@Query() query) {
    return await this.authService.accessTokenReissuance(query.refreshToken);
  }
}
