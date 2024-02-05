import express from 'express';
import type { Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';

import * as VideoService from './video.service';

export const videoRouter = express.Router();

videoRouter.get('/', async (request: Request, response: Response) => {
  try {
    const videos = await VideoService.listVideos();
    return response.status(200).json({ data: videos });
  } catch (error: any) {
    return response.status(500).json({ error: error.message });
  }
});

videoRouter.get(
  '/:id',
  [param('id').isUUID()],
  async (request: Request, response: Response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      return response.status(400).json({ error: errors.array() });
    }
    const id: string = request.params.id;

    try {
      const video = await VideoService.getVideo(id);
      if (video) {
        return response.status(200).json({ data: video });
      }
      return response.status(404).json({ message: 'Video could not be found' });
    } catch (error: any) {
      return response.status(500).json({ error: error.message });
    }
  }
);

videoRouter.post(
  '/',
  body('title').isString(),
  body('userId').isString(),
  body('description').isString(),
  body('uploadedAt').optional().isISO8601(),
  body('credits').optional().isString(),
  body('isPrivate').optional().isBoolean(),
  body('likes').optional().isNumeric(),
  async (request: Request, response: Response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      return response.status(400).json({ error: errors.array() });
    }
    try {
      const videoData = request.body;
      const newVideo = await VideoService.createVideo(videoData);
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
  [param('id').isUUID()],
  body('title').isString(),
  body('userId').isString(),
  body('description').isString(),
  body('uploadedAt').optional().isISO8601(),
  body('credits').optional().isString(),
  body('isPrivate').optional().isBoolean(),
  body('likes').optional().isNumeric(),
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
        .status(204)
        .json({ message: 'Video was successfully deleted' });
    } catch (error: any) {
      return response.status(500).json({ error: error.message });
    }
  }
);
