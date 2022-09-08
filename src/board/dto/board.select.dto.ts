import { ApiProperty } from '@nestjs/swagger';

//게시판 데이터
export class BoardSelectDto {
  @ApiProperty({
    example: 'a4e123ae-e815-469e-bfe9-3582ae718a8a',
    description: '게시판 아이디',
  })
  noticeId: string;

  @ApiProperty({ example: '100', description: '카테고리(코드값)' })
  category: string;

  @ApiProperty({
    example: '카페 마마스 같이 시키실 분? 마포중앙도서관 근처',
    description: '제목',
  })
  title: string;

  @ApiProperty({ example: '4200', description: '가격' })
  price: string;

  @ApiProperty({ example: '2', description: '인원' })
  personnel: string;

  @ApiProperty({ example: '2022-08-23', description: '마켓 기한' })
  deadline: string;

  @ApiProperty({ example: 'img', description: '게시판 이미지' })
  noticeImg: string;
}

//게시판 조회 Output 데이터
export class BoardSelectOutputDto {
  @ApiProperty({
    example: 200,
    description: '상태코드',
  })
  statusCode: number;

  @ApiProperty({
    example: '게시판 조회 성공',
    description: '설명',
  })
  message: string;

  @ApiProperty({
    example: '1',
    description: '게시판 수',
  })
  count: string;

  @ApiProperty({ type: [BoardSelectDto] })
  data: BoardSelectDto;
}
