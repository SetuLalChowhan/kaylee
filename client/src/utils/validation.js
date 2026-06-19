/**
 * Shared validation rules matching the backend Zod schemas.
 * These mirror server/src/validations/user.validation.ts exactly.
 */

/**
 * Password validation rules matching the backend `passwordValidation` Zod schema.
 * Rules: 8-32 chars, uppercase, lowercase, number, special character.
 */
export const PASSWORD_RULES = {
  required: 'Password is required',
  minLength: { value: 8, message: 'Password must be at least 8 characters' },
  maxLength: { value: 32, message: 'Password cannot exceed 32 characters' },
  validate: {
    uppercase: (value) =>
      /[A-Z]/.test(value) || 'Password must contain at least one uppercase letter',
    lowercase: (value) =>
      /[a-z]/.test(value) || 'Password must contain at least one lowercase letter',
    number: (value) =>
      /[0-9]/.test(value) || 'Password must contain at least one number',
    special: (value) =>
      /[!@#$%^&*(),.?":{}|<>]/.test(value) ||
      'Password must contain at least one special character',
  },
};

/**
 * Confirm password validation — ensures value matches the original password.
 * Usage: pass the watched password value as `originalPassword`.
 */
export const CONFIRM_PASSWORD_RULES = (originalPassword) => ({
  required: 'Confirm password is required',
  validate: (value) => value === originalPassword || "Passwords don't match",
});

/**
 * Email validation rules.
 */
export const EMAIL_RULES = {
  required: 'Email is required',
  pattern: {
    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Invalid email address',
  },
};

/**
 * Name validation rules (firstName, lastName).
 */
export const NAME_RULES = {
  required: 'This field is required',
  minLength: { value: 1, message: 'This field is required' },
  maxLength: { value: 50, message: 'Cannot exceed 50 characters' },
};
