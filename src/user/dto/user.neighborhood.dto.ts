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
export class NeighborhoodSelectOutputDto {
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
