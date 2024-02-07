import express from 'express';
import type { Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { isAuthorizedUser } from '../user/user.middlewares';
import { isVideoOwner, populateUserIfAuthenticated } from './video.middlewares';
import * as VideoService from './video.service';

export const videoRouter = express.Router();

videoRouter.get(
  '/',
  populateUserIfAuthenticated,
  async (request: Request, response: Response) => {
    const sort = request.query.sort;
    const order = request.query.order;

    if (sort && sort !== 'likes' && sort !== 'title') {
      return response.status(400).json({ error: 'Invalid sort value' });
    }

    if (order && order !== 'asc' && order !== 'desc') {
      return response.status(400).json({ error: 'Invalid order value' });
    }

    try {
      const userId = response.locals.user?.id;
      const videos = await VideoService.listVideos(
        userId,
        sort as 'likes' | 'title',
        order as 'asc' | 'desc'
      );

      return response.status(200).json({ data: videos });
    } catch (error: any) {
      return response.status(500).json({ error: error.message });
    }
  }
);

videoRouter.get(
  '/:id',
  populateUserIfAuthenticated,
  [param('id').isUUID()],
  async (request: Request, response: Response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      return response.status(400).json({ error: errors.array() });
    }
    const id: string = request.params.id;
    const userId = response.locals.user?.id;

    try {
      const video = await VideoService.getVideo(id);

      if (!video) {
        return response.status(404).json({ error: 'Video could not be found' });
      }

      if (video.isPrivate && video.userId !== userId) {
        return response.status(403).json({ message: 'This video is private' });
      }

      return response.status(200).json({ data: video });
    } catch (error: any) {
      return response.status(500).json({ error: error.message });
    }
  }
);

videoRouter.post(
  '/',
  isAuthorizedUser,
  body('title').isString(),
  body('description').isString(),
  body('credits').optional().isString(),
  body('isPrivate').optional().isBoolean(),
  async (request: Request, response: Response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      return response.status(400).json({ error: errors.array() });
    }
    try {
      const videoData = request.body;
      const newVideo = await VideoService.createVideo(
        videoData,
        response.locals.user.id
      );
      return response
        .status(201)
        .json({ message: 'Video was succesfully uploaded', data: newVideo });
    } catch (error: any) {
      return response.status(500).json({ error: error.message });
    }
  }
);

videoRouter.put(
  '/:id',
  isAuthorizedUser,
  isVideoOwner,
  [param('id').isUUID()],
  body('title').optional().isString(),
  body('description').optional().isString(),
  body('credits').optional().isString(),
  body('isPrivate').optional().isBoolean(),
  async (request: Request, response: Response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      return response.status(400).json({ error: errors.array() });
    }
    const id: string = request.params.id;
    try {
      const videoUpdateData = request.body;
      const updatedVideo = await VideoService.updateVideo(id, videoUpdateData);
      return response.status(200).json({
        message: 'Video info was succesfully updated',
        data: updatedVideo,
      });
    } catch (error: any) {
      return response.status(500).json({ error: error.message });
    }
  }
);

videoRouter.delete(
  '/:id',
  isAuthorizedUser,
  isVideoOwner,
  [param('id').isUUID()],
  async (request: Request, response: Response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      return response.status(400).json({ error: errors.array() });
    }
    const id: string = request.params.id;
    try {
      await VideoService.deleteVideo(id);
      return response
        .status(200)
        .json({ message: 'Video was successfully deleted' });
    } catch (error: any) {
      return response.status(500).json({ error: error.message });
    }
  }
);

videoRouter.post(
  '/:id/like',
  [param('id').isUUID()],
  async (request: Request, response: Response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      return response.status(400).json({ error: errors.array() });
    }
    const videoId: string = request.params.id;

    try {
      const updatedVideo = await VideoService.addLikeToVideo(videoId);
      return response.status(200).json({
        message: 'Like was successfully added to the video',
        data: updatedVideo,
      });
    } catch (error: any) {
      return response.status(500).json({ error: error.message });
    }
  }
);

videoRouter.delete(
  '/:id/like',
  [param('id').isUUID()],
  async (request: Request, response: Response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      return response.status(400).json({ error: errors.array() });
    }
    const videoId: string = request.params.id;

    try {
      const updatedVideo = await VideoService.removeLikeFromVideo(videoId);
      return response.status(200).json({
        message: 'Like was successfully removed from the video',
        data: updatedVideo,
      });
    } catch (error: any) {
      return response.status(500).json({ error: error.message });
    }
  }
);
