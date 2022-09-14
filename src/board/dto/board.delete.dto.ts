import { ApiProperty } from '@nestjs/swagger';

export class BoardDeleteOutputDto {
  @ApiProperty({
    example: 200,
    description: '상태코드',
  })
  statusCode: number;

  @ApiProperty({
    example: '게시판 삭제 성공',
    description: '설명',
  })
  message: string;
}
