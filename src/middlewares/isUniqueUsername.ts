import { check } from 'express-validator';
import { getUserByUsername } from '../user/user.service';

export function isUniqueUsername() {
  return check('username')
    .isString()
    .withMessage('Username must be a string')
    .custom(async (username) => {
      const user = await getUserByUsername(username);
      if (user) {
        throw new Error('Username already in use');
      }
    });
}
