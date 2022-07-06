import { ApiProperty } from '@nestjs/swagger';

export class AccessTokenReissuanceOutputDto {
  @ApiProperty({
    example: 200,
    description: '상태코드',
  })
  statusCode: number;

  @ApiProperty({
    example: 'accessToken 재발급 성공',
    description: '설명',
  })
  message: string;

  @ApiProperty({ example: 'accessToken' })
  accessToken: string;
}
