import { ApiProperty } from '@nestjs/swagger';

export class BoardMenuDto {
  @ApiProperty({ example: ['카테고리'], description: '카테고리' })
  category: [];
  @ApiProperty({ example: ['공유방법'], description: '공유방법' })
  howShare: [];
}

//게시판 메뉴 조회 Output 데이터
export class SelectBoardMenuOutputDto {
  @ApiProperty({
    example: 200,
    description: '상태코드',
  })
  statusCode: number;

  @ApiProperty({
    example: '게시판 등록 메뉴 조회 성공',
    description: '설명',
  })
  message: string;

  @ApiProperty()
  data: BoardMenuDto;
}
