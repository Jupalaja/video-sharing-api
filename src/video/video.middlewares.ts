import { NextFunction, Request, Response } from 'express';
import * as VideoService from './video.service';
import jwt, { JwtPayload } from 'jsonwebtoken';

interface TokenPayload extends JwtPayload {
  userId: number;
  username: string;
}
export const isVideoOwner = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const loggedInUserId = res.locals.user?.id;

  (async () => {
    try {
      const videoId = req.params.id;
      const video = await VideoService.getVideo(videoId);
      if (!video) {
        return res.status(404).json({ error: 'Video not found.' });
      }
      if (loggedInUserId === video.userId) {
        return next();
      } else {
        return res
          .status(403)
          .json({ error: 'You are not allowed to modify this video.' });
      }
    } catch (error: any) {
      return res.status(500).json({ error: 'Failed to check video ownership' });
    }
  })();
};

export const populateUserIfAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    try {
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new Error('JWT secret not provided in environment');
      }

      const tokenPayload = jwt.verify(token, jwtSecret) as TokenPayload;

      if (!tokenPayload) {
        throw new Error('Invalid or expired token');
      }

      res.locals.user = {
        id: tokenPayload.userId,
        username: tokenPayload.username,
      };
    } catch (error: any) {
      console.error('Error verifying token:', error);
    }
  }
  next();
};
