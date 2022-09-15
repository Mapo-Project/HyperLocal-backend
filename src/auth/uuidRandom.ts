import { v4 as uuid } from 'uuid';

export default (social_id: string) => {
  const uuidPath = `${uuid()}-${social_id}`;
  return uuidPath;
};
