import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class BoardRegisterInputDto {
  @ApiProperty({
    type: 'array',
    name: 'board',
    required: false,
    items: {
      type: 'string',
      format: 'binary',
    },
  })
  board_img: string;

  @ApiProperty({ example: '100', description: '카테고리(공통코드)' })
  @IsNotEmpty()
  category: string;

  @ApiProperty({
    example: '카페 마마스 같이 시키실 분? 마포중앙도서관 근처',
    description: '제목',
  })
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example:
      '샐러드랑 청포도주스 먹고싶은데 동네에 카페 마마스가 없어서 배민으로 주문하려고 합니다. 마포중앙도서관 앞에서 만나 같이 주문하고 배달비 나눠내요~',
    description: '설명',
  })
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    example: '링크 주소',
    description: '링크',
  })
  link: string;

  @ApiProperty({
    example: 'N',
    description: '용기 여부',
  })
  @IsNotEmpty()
  container_yn: string;

  @ApiProperty({
    example: 'N',
    description: '홈 메이드 여부',
  })
  @IsNotEmpty()
  homemade_yn: string;

  @ApiProperty({
    example: '4200',
    description: '가격',
  })
  @IsNotEmpty()
  price: string;

  @ApiProperty({
    example: '100',
    description: '공유 방법(공통코드)',
  })
  @IsNotEmpty()
  how_share: string;

  @ApiProperty({
    example: '2',
    description: '인원',
  })
  @IsNotEmpty()
  personnel: string;

  @ApiProperty({
    example: '2022-08-23',
    description: '마켓 기한',
  })
  @IsNotEmpty()
  deadline: string;
}

export class BoardRegisterOutputDto {
  @ApiProperty({
    example: '201',
    description: '상태코드',
  })
  statusCode: number;

  @ApiProperty({
    example: '게시판 등록 성공',
    description: '설명',
  })
  message: string;
}
