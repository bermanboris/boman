import { createError } from 'apollo-errors';

// Hide any unknown errors such as database connection issues
export const UnknownError = createError('UnknownError', {
  message: 'A unknown error has occurred',
});

// User must be logged-in to perform the operation
export const UnauthorizedError = createError('UnauthorizedError', {
  message: 'You must be logged in to do that',
});

// User should NOT be logged in to perform the operation
export const AlreadyAuthenticatedError = createError('AlreadyAuthenticatedError', {
  message: 'You are already authenticated',
});

// User don't have proper access permissions
export const ForbiddenError = createError('ForbiddenError', {
  message: 'You are not allowed to do that',
});

// Incorrect credentials
export const InvalidCredentials = createError('InvalidCredentials', {
  message: 'Incorrect email or password',
});

export const EmailNotValidated = createError('EmailNotValidated', {
  message: 'Validate your email first',
});
