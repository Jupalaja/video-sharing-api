import { db } from '../config/db.server';

export type User = {
  id: number;
  username: string;
  email: string;
  password: string;
  registerDate: Date;
};

export const listUsers = async (): Promise<Partial<User>[]> => {
  return db.user.findMany({
    select: {
      id: true,
      username: true,
      email: true,
      registerDate: true,
    },
  });
};

export const getUser = async (id: number): Promise<Partial<User> | null> => {
  return db.user.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      username: true,
      email: true,
      registerDate: true,
    },
  });
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  return db.user.findUnique({
    where: {
      email,
    },
  });
};

export const getUserByUsername = async (
  username: string
): Promise<User | null> => {
  return db.user.findUnique({
    where: {
      username,
    },
  });
};

export const createUser = async (
  user: Omit<User, 'id' | 'registerDate'>
): Promise<Partial<User>> => {
  return db.user.create({
    data: user,
    select: {
      id: true,
      username: true,
      email: true,
      registerDate: true,
    },
  });
};

export const updateUser = async (
  id: number,
  newPassword: string
): Promise<Partial<User>> => {
  return db.user.update({
    where: {
      id,
    },
    data: {
      password: newPassword,
    },
    select: {
      id: true,
      username: true,
      email: true,
      registerDate: true,
    },
  });
};

export const deleteUser = async (id: number): Promise<void> => {
  await db.user.delete({
    where: {
      id,
    },
  });
};
