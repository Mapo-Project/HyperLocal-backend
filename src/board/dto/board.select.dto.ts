import { ApiProperty } from '@nestjs/swagger';

//게시판 데이터
export class BoardSelectDto {
  @ApiProperty({
    example: 1,
    description: '게시판 아이디',
  })
  noticeId: number;

  @ApiProperty({ example: '100', description: '카테고리(코드값)' })
  category: string;

  @ApiProperty({
    example: '카페 마마스 같이 시키실 분? 마포중앙도서관 근처',
    description: '제목',
  })
  title: string;

  @ApiProperty({ example: 4200, description: '가격' })
  price: number;

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

//게시판 상세 이미지 데이터
export class BoardDetailImgSelectDto {
  @ApiProperty({ example: 1, description: '게시판 이미지 아이디' })
  imgId: number;

  @ApiProperty({ example: 'imgUrl', description: '게시판 이미지' })
  img: string;
}

//게시판 상세 데이터
export class BoardDetailSelectDto {
  @ApiProperty({
    example: 1,
    description: '게시판 아이디',
  })
  noticeId: number;

  @ApiProperty({
    example: '98bb81cd-532e-40b5-9b4b-7c8f70d6af1b-2329907613',
    description: '유저 아이디',
  })
  userId: string;

  @ApiProperty({
    example: '성산동',
    description: '동 이름',
  })
  nghbrName: string;

  @ApiProperty({ example: '100', description: '카테고리(코드값)' })
  category: string;

  @ApiProperty({
    example: '카페 마마스 같이 시키실 분? 마포중앙도서관 근처',
    description: '제목',
  })
  title: string;

  @ApiProperty({
    example:
      '샐러드랑 청포도주스 먹고싶은데 동네에 카페 마마스가 없어서 배민으로 주문하려고 합니다. 마포중앙도서관 앞에서 만나 같이 주문하고 배달비 나눠내요~',
    description: '상세 내용',
  })
  description: string;

  @ApiProperty({ example: 'null', description: '링크' })
  link: string;

  @ApiProperty({ example: 'N', description: '용기 여부' })
  containerYN: string;

  @ApiProperty({ example: 'N', description: '홈메이드 여부' })
  homemadeYN: string;

  @ApiProperty({ example: 4200, description: '가격' })
  price: number;

  @ApiProperty({ example: '100', description: '공유방법' })
  howShare: string;

  @ApiProperty({ example: '2', description: '인원' })
  personnel: string;

  @ApiProperty({ example: '2022-08-23', description: '마켓 기한' })
  deadline: string;

  @ApiProperty({
    example: '2022-09-08T02:06:16.000Z',
    description: '등록 날짜',
  })
  insertDT: string;

  @ApiProperty({
    example: 'profile url',
    description: '유저 프로필 이미지',
  })
  userImg: string;

  @ApiProperty({ type: [BoardDetailImgSelectDto] })
  noticeImg: BoardDetailImgSelectDto;
}

//게시판 상세 조회 Output 데이터
export class BoardDetailSelectOutputDto {
  @ApiProperty({
    example: 200,
    description: '상태코드',
  })
  statusCode: number;

  @ApiProperty({
    example: '게시판 상세 조회 성공',
    description: '설명',
  })
  message: string;

  @ApiProperty({ type: [BoardDetailSelectDto] })
  data: BoardDetailSelectDto;
}
