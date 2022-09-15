import { ApiProperty } from '@nestjs/swagger';

//회원 탈퇴 Output 데이터
export class UserWithdrawalOutputDto {
  @ApiProperty({
    example: 200,
    description: '상태코드',
  })
  statusCode: number;

  @ApiProperty({
    example: '회원 탈퇴 성공',
    description: '설명',
  })
  message: string;
}
