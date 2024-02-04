import express from 'express';
import type { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';

import * as VideoService from './video.service';

export const videoRouter = express.Router();

// GET: List all the videos
videoRouter.get('/', async (request: Request, response: Response) => {
  try {
    const videos = await VideoService.listVideos();
    return response.status(200).json(videos);
  } catch (error: any) {
    return response.status(500).json(error.message);
  }
});

// GET: A video based on the id
videoRouter.get('/:id', async (request: Request, response: Response) => {
  const id: string = request.params.id;

  try {
    const video = await VideoService.getVideo(id);
    if (video) {
      return response.status(200).json(video);
    }
    return response.status(404).json('Video could not be found');
  } catch (error: any) {
    return response.status(500).json(error.message);
  }
});

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
      return response.status(400).json({ errors: errors.array() });
    }
    try {
      const videoData = request.body;
      const newVideo = await VideoService.createVideo(videoData);
      return response.status(201).json(newVideo);
    } catch (error: any) {
      return response.status(500).json(error.message);
    }
  }
);

// PUT: Update video
videoRouter.put(
  '/:id',
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
      return response.status(400).json({ errors: errors.array() });
    }
    const id: string = request.params.id;
    try {
      const videoUpdateData = request.body;
      const updatedVideo = await VideoService.updateVideo(id, videoUpdateData);
      return response.status(200).json(updatedVideo);
    } catch (error: any) {
      return response.status(500).json(error.message);
    }
  }
);

videoRouter.delete('/:id', async (request: Request, response: Response) => {
  const id: string = request.params.id;
  try {
    await VideoService.deleteVideo(id);
    return response.status(204).json('Video was successfully deleted');
  } catch (error: any) {
    return response.status(500).json(error.message);
  }
});
