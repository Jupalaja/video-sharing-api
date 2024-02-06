import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { User, getUserByEmail, getUserByUsername } from '../user/user.service';

export function signJwt(payload: object): string {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '2h',
  });
}

export async function authenticateUser(
  identifier: string,
  password: string
): Promise<{ user: Partial<User>; token: string } | null> {
  const userByEmail = await getUserByEmail(identifier);
  const user = userByEmail || (await getUserByUsername(identifier));

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return null;
  }

  const token = signJwt({ userId: user.id, username: user.username });
  return {
    user: { id: user.id, username: user.username, email: user.email },
    token,
  };
}
