import { HttpException } from '@nestjs/common';
import { existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import uuidRandom from './uuidRandom';

export const multerOptions = {
  limits: {
    fileSize: 1024 * 1024 * 5,
  },

  fileFilter: (request, file, callback) => {
    if (file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
      // 이미지 형식은 jpg, jpeg, png만 허용합니다.
      callback(null, true);
    } else {
      callback(
        new HttpException('지원하지 않는 이미지 형식입니다.', 404),
        false,
      );
    }
  },

  storage: diskStorage({
    destination: (request, file, callback) => {
      const fieldname = file.fieldname;
      if (fieldname === 'profile') {
        const uploadPath = 'upload/user/profile';

        if (!existsSync(uploadPath)) {
          // upload 폴더가 존재하지 않을시, 생성합니다.
          mkdirSync(uploadPath, { recursive: true });
        }

        callback(null, uploadPath);
      }
    },

    filename: (request, file, callback) => {
      callback(null, uuidRandom(file));
    },
  }),
};

export const createImageURL = (file): string => {
  const fieldname = file.fieldname;
  const serverAddress: string = process.env.BACK_URL;

  // 파일이 저장되는 경로
  if (fieldname === 'profile') {
    return `${serverAddress}/upload/user/profile/${file.filename}`;
  }
};
