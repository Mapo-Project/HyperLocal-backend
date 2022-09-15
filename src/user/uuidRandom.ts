import { v4 as uuid } from 'uuid';

export default (file): string => {
  const uuidPath = `${uuid()}-${file.originalname}`;
  return uuidPath;
};
