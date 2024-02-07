import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

interface TokenPayload extends JwtPayload {
  userId: number;
  username: string;
}

export const isAuthorizedUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res
        .status(401)
        .json({ error: 'Access denied. No token provided.' });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT secret not provided in environment');
    }

    const tokenPayload = jwt.verify(token, jwtSecret) as TokenPayload;

    if (!tokenPayload) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Attach the token payload to res.locals which is safe to extend
    res.locals.user = {
      id: tokenPayload.userId,
      username: tokenPayload.username,
    };
    next();
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(400).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    console.error('Token verification error:', error);
    res.status(500).json({ error: 'Failed to authenticate token' });
  }
};

export const isAllowedUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const loggedInUserId = res.locals.user?.id;

  const targetUserId = parseInt(req.params.id, 10);

  if (loggedInUserId === targetUserId) {
    next();
  } else {
    res
      .status(403)
      .json({ error: "You are not allowed to modify other user's data." });
  }
};
