import { ApiProperty } from '@nestjs/swagger';

//회원 동네 등록 Output 데이터
export class NeighborhoodRegistrationOutputDto {
  @ApiProperty({
    example: 201,
    description: '상태코드',
  })
  statusCode: number;

  @ApiProperty({
    example: '회원 동네 등록 성공',
    description: '설명',
  })
  message: string;
}

//회원 동네 선택 Output 데이터
export class NeighborhoodChoiceOutputDto {
  @ApiProperty({
    example: 201,
    description: '상태코드',
  })
  statusCode: number;

  @ApiProperty({
    example: '회원 동네 선택 성공',
    description: '설명',
  })
  message: string;
}

//회원 프로필 데이터
export class NeighborhoodDto {
  @ApiProperty({ example: 1, description: '동네ID' })
  neighborhoodId: number;

  @ApiProperty({ example: '성산동', description: '동이름' })
  neighborhoodName: string;

  @ApiProperty({ example: 'Y', description: '동네선택여부' })
  choiceYN: string;
}

//회원 동네 조회 Output 데이터
export class NeighborhoodSelectOutputDto {
  @ApiProperty({
    example: 200,
    description: '상태코드',
  })
  statusCode: number;

  @ApiProperty({
    example: '회원 동네 조회 성공',
    description: '설명',
  })
  message: string;

  @ApiProperty({
    example: '3',
    description: '회원 동네 갯수',
  })
  count: string;

  @ApiProperty({ type: [NeighborhoodDto] })
  data: NeighborhoodDto;
}
