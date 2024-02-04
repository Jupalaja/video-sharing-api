import { db } from '../utils/db.server';

export type User = {
  id: string;
  username: string;
  email: string;
  hashedPassword: string;
  fechaRegistro: Date; // Assuming this is 'registration date'
};

// List all users with minimal sensitive data for public exposure
export const listUsers = async (): Promise<Partial<User>[]> => {
  return db.user.findMany({
    select: {
      id: true,
      username: true,
      email: true,
      fechaRegistro: true,
      // Do not include hashedPassword for security reasons
    },
  });
};

// Get a single user by ID with sensitive data excluded
export const getUser = async (id: string): Promise<Partial<User> | null> => {
  return db.user.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      username: true,
      email: true,
      fechaRegistro: true,
      // Do not include hashedPassword for security reasons
    },
  });
};

// Create a new user
export const createUser = async (
  user: Omit<User, 'id' | 'fechaRegistro'>
): Promise<User> => {
  return db.user.create({
    data: user,
  });
};

// Update an existing user by ID
export const updateUser = async (
  id: string,
  userUpdateData: Partial<Omit<User, 'id' | 'hashedPassword'>>
): Promise<User> => {
  return db.user.update({
    where: {
      id,
    },
    data: userUpdateData,
  });
};

// Delete a user by ID
export const deleteUser = async (id: string): Promise<void> => {
  await db.user.delete({
    where: {
      id,
    },
  });
};
