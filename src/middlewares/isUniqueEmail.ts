import { check } from 'express-validator';
import { getUserByEmail } from '../user/user.service';

export function isUniqueEmail() {
  return check('email')
    .isEmail()
    .withMessage('Must be a valid email address')
    .custom(async (email) => {
      const user = await getUserByEmail(email);
      if (user) {
        throw new Error('Email already in use');
      }
    });
}
