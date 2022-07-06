import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

//회원 프로필 등록 Input 데이터
export class ProfileDetailInputDto {
  @ApiProperty({ example: '이름' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '닉네임' })
  @IsNotEmpty()
  nickname: string;
}

//회원 프로필 등록 Output 데이터
export class ProfileDetailOutputDto {
  @ApiProperty({
    example: 201,
    description: '상태코드',
  })
  statusCode: number;

  @ApiProperty({
    example: '회원 프로필 추가정보 등록 성공',
    description: '설명',
  })
  message: string;
}

//회원 프로필 데이터
export class ProfileDetailDto {
  @ApiProperty({ example: '이름' })
  name: string;
  @ApiProperty({ example: '닉네임' })
  nickname: string;
  @ApiProperty({ example: 'sns유형' })
  method: string;
  @ApiProperty({ example: '이메일' })
  email: string;
  @ApiProperty({ example: '프로필사진' })
  profile_img: string;
}

//회원 프로필 조회 Output 데이터
export class SelectProfileOutputDto {
  @ApiProperty({
    example: 200,
    description: '상태코드',
  })
  statusCode: number;

  @ApiProperty({
    example: '회원 프로필 조회 성공',
    description: '설명',
  })
  message: string;

  @ApiProperty()
  data: ProfileDetailDto;
}

//회원 프로필 수정 Input 데이터
export class ModifyProfileDetailInputDto {
  @ApiProperty({ example: '이름' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '닉네임' })
  @IsNotEmpty()
  nickname: string;

  @ApiProperty({ example: '이메일@secondLife.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

//회원 프로필 수정 Output 데이터
export class ModifyProfileDetailOutputDto {
  @ApiProperty({
    example: 201,
    description: '상태코드',
  })
  statusCode: number;

  @ApiProperty({
    example: '회원 프로필 수정 성공',
    description: '설명',
  })
  message: string;
}

//회원 프로필 이미지 수정 Input 데이터
export class ModifyProfileImgInputDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    name: 'profile',
    required: false,
  })
  @IsNotEmpty()
  profile_img: string;
}

//회원 프로필 이미지 수정 Output 데이터
export class ModifyProfileImgOutputDto {
  @ApiProperty({
    example: 201,
    description: '상태코드',
  })
  statusCode: number;

  @ApiProperty({
    example: '회원 프로필 이미지 수정 성공',
    description: '설명',
  })
  message: string;
}
