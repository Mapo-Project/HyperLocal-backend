import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  social_id: string;
  role_id: number;
  email: string;
  profile_img: string;
}

//소셜 회원 로그인 Output 데이터
export class UserSocialLoginOutputDto {
  @ApiProperty({
    example: 200,
    description: '상태코드',
  })
  statusCode: number;

  @ApiProperty({
    example: '로그인 성공',
    description: '설명',
  })
  message: string;

  @ApiProperty({
    example: 'N',
    description: '추가정보 입력 여부',
  })
  verify: string;

  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZWZlZnNlMTEyNSIsImlhdCI6MTYzMTA4OTQyNn0.m4gl3atBiQZWnWCJlvxjvVeyPO-JN6_cR2pcgcovyKo',
    description: 'access토큰',
  })
  accessToken: string;

  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZWZlZnNlMTEyNSIsImlhdCI6MTYzMTA4OTQyNn0.m4gl3atBiQZWnWCJlvxjvVeyPO-JN6_cR2pcgcovyKo',
    description: 'refresh토큰',
  })
  refreshToken: string;
}
