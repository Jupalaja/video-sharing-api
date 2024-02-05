import express from 'express';
import type { Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { isUniqueEmail } from '../middlewares/isUniqueEmail';
import { hashPassword } from '../middlewares/hashPassword';
import { isValidPassword } from '../middlewares/isValidPassword';
import { isUniqueUsername } from '../middlewares/isUniqueUsername';

import * as UserService from './user.service';

export const userRouter = express.Router();

userRouter.get('/', async (request: Request, response: Response) => {
  try {
    const users = await UserService.listUsers();
    return response.status(200).json({ data: users });
  } catch (error: any) {
    return response.status(500).json({ error: error.message });
  }
});

userRouter.get(
  '/:id',
  [param('id').isInt()],
  async (request: Request, response: Response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      return response.status(400).json({ error: errors.array() });
    }
    const id: number = parseInt(request.params.id, 10);

    try {
      const user = await UserService.getUser(id);
      if (user) {
        return response.status(200).json({ data: user });
      }
      return response.status(404).json({ error: 'User could not be found' });
    } catch (error: any) {
      return response.status(500).json({ error: error.message });
    }
  }
);

userRouter.post(
  '/',
  body('username').isString(),
  isUniqueEmail(),
  isUniqueUsername(),
  isValidPassword(),
  hashPassword,
  async (request: Request, response: Response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      return response.status(400).json({ error: errors.array() });
    }
    try {
      const user = request.body;
      const newUser = await UserService.createUser(user);
      return response.status(201).json({
        message: 'User successfully added',
        data: newUser,
      });
    } catch (error: any) {
      return response.status(500).json({ error: error.message });
    }
  }
);

userRouter.put(
  '/:id',
  [param('id').isInt()],
  body('username').isString(),
  isValidPassword(),
  hashPassword,
  async (request: Request, response: Response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      return response.status(400).json({ error: errors.array() });
    }
    const id: number = parseInt(request.params.id, 10);
    const newPassword: string = request.body.password;

    try {
      const user = await UserService.updateUser(id, newPassword);
      return response.status(200).json({
        message: 'User password successfully updated',
        data: { user },
      });
    } catch (error: any) {
      return response.status(500).json({ error: error.message });
    }
  }
);

userRouter.delete(
  '/:id',
  [param('id').isInt()],
  async (request: Request, response: Response) => {
    const id: number = parseInt(request.params.id, 10);
    try {
      await UserService.deleteUser(id);
      return response
        .status(204)
        .json({ message: 'User has been successfully deleted' });
    } catch (error: any) {
      return response.status(500).json({ error: error.message });
    }
  }
);
