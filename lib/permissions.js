import { createPermission } from './helpers';
import * as Errors from '../errors';

export const isAdmin = createPermission({
  error: Errors.ForbiddenError,
  validate: user => user.isAdmin,
});

export const isNotAuthenticated = createPermission({
  error: Errors.AlreadyAuthenticatedError,
  validate: user => user.id,
});

export const isAuthenticated = createPermission({
  error: Errors.UnauthorizedError,
  validate: user => !user.id,
});
