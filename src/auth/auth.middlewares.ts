import bcrypt from 'bcrypt';
import { check } from 'express-validator';
import { getUserByEmail, getUserByUsername } from '../user/user.service';
import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';

export const isValidPassword = () => {
  return check('password')
    .isString()
    .withMessage('Password must be a string')
    .bail()
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/\d/)
    .withMessage('Password must contain a number')
    .matches(/[A-Z]/)
    .withMessage('Password must contain an uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain a lowercase letter')
    .bail();
};

export const hashPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req).formatWith(
    ({ msg, param, location }) => ({
      msg,
      param,
      location,
    })
  );
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array() });
  }

  try {
    const password = req.body.password;
    const hashedPassword = await bcrypt.hash(password, 10);
    req.body.password = hashedPassword;
    next();
  } catch (error) {
    res.status(500).json({ error: 'Error hashing the password.' });
  }
};

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
