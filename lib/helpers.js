import { UnknownError } from '../errors';

export const createPermission = ({ error: UserError = UnknownError, validate }) => (user = {}) => {
  if (validate(user)) throw new UserError();
};
