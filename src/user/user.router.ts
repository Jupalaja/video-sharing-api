import express from 'express';
import type { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';

import * as UserService from './user.service';

export const userRouter = express.Router();

// GET: List of all Users
userRouter.get('/', async (request: Request, response: Response) => {
  try {
    const users = await UserService.listUsers();
    return response.status(200).json(users);
  } catch (error: any) {
    return response.status(500).json(error.message);
  }
});

// GET: A single user by ID
userRouter.get('/:id', async (request: Request, response: Response) => {
  const id: string = request.params.id;
  try {
    const user = await UserService.getUser(id);
    if (user) {
      return response.status(200).json(user);
    }
    return response.status(404).json('User could not be found');
  } catch (error: any) {
    return response.status(500).json(error.message);
  }
});

// POST: Create a User
// Params: username, email, hashedPassword
userRouter.post(
  '/',
  body('username').isString(),
  body('email').isEmail(),
  body('hashedPassword').isString(),
  async (request: Request, response: Response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      return response.status(400).json({ errors: errors.array() });
    }
    try {
      const user = request.body;
      const newUser = await UserService.createUser(user);
      return response.status(201).json(newUser);
    } catch (error: any) {
      return response.status(500).json(error.message);
    }
  }
);

// PUT: Updating a User
// Params: username, email (hashedPassword not included, should be changed through a different secure process)
userRouter.put(
  '/:id',
  body('username').isString(),
  body('email').isEmail(),
  async (request: Request, response: Response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      return response.status(400).json({ errors: errors.array() });
    }
    const id: string = request.params.id;
    try {
      const userUpdateData = request.body;
      const updatedUser = await UserService.updateUser(id, userUpdateData);
      return response.status(200).json(updatedUser);
    } catch (error: any) {
      return response.status(500).json(error.message);
    }
  }
);

// DELETE: Delete a user based on the id
userRouter.delete('/:id', async (request: Request, response: Response) => {
  const id: string = request.params.id;
  try {
    await UserService.deleteUser(id);
    return response.status(204).json('User has been successfully deleted');
  } catch (error: any) {
    return response.status(500).json(error.message);
  }
});
