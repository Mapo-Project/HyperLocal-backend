import { ApiProperty } from '@nestjs/swagger';

//회원 로그아웃 Output 데이터
export class UserLogoutOutputDto {
  @ApiProperty({
    example: 200,
    description: '상태코드',
  })
  statusCode: number;

  @ApiProperty({
    example: '회원 로그아웃 성공',
    description: '설명',
  })
  message: string;
}
