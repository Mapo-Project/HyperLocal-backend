import { ApiProperty } from '@nestjs/swagger';

export class AccessTokenReissuanceInputDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiMjMwNDcwNj',
    description: 'refreshToken 값',
  })
  refreshToken: string;
}

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

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiMjMwNDcwNj',
    description: 'accessToken 값',
  })
  accessToken: string;
}
