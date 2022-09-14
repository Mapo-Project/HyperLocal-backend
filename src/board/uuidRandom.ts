import { v4 as uuid } from 'uuid';

export default () => {
  const uuidPath = `${uuid()}`;
  return uuidPath;
};
