import express, { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import * as UserService from '../user/user.service';
import { signJwt, authenticateUser } from './auth.service';
import { body } from 'express-validator';
import {
  isUniqueEmail,
  isUniqueUsername,
  isValidPassword,
  hashPassword,
} from './auth.middlewares';

export const authRouter = express.Router();

authRouter.post(
  '/signup',
  body('username').isString(),
  isUniqueEmail(),
  isUniqueUsername(),
  isValidPassword(),
  hashPassword,
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ error: errors.array() });

    try {
      const user = await UserService.createUser(req.body);

      const token = signJwt({ userId: user.id, username: user.username });

      return res
        .status(201)
        .json({ message: 'Signup successful', token, data: user });
    } catch (err: any) {
      if (err.code === 'P2002') {
        return res
          .status(400)
          .json({ error: 'Signup failed, please try different credentials' });
      }
      res.status(500).json({ error: err.message });
    }
  }
);

authRouter.post(
  '/login',
  body('identifier').isString(),
  body('password').isString().withMessage('Password must be provided'),
  async (req: Request, res: Response) => {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res
        .status(400)
        .json({ error: 'Username/email and password are required' });
    }

    try {
      const authResult = await authenticateUser(identifier, password);

      if (!authResult) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      return res.status(200).json(authResult);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
);
