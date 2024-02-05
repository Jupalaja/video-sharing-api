import { db } from '../config/db.server';

export type Video = {
  id: string;
  title: string;
  description: string;
  uploadedAt: Date;
  credits?: string | null;
  isPrivate: boolean;
  likes: number;
  userId: number;
};

export const listVideos = async (): Promise<Video[]> => {
  return db.video.findMany({
    select: {
      id: true,
      title: true,
      description: true,
      uploadedAt: true,
      credits: true,
      isPrivate: true,
      likes: true,
      userId: true,
    },
  });
};

export const getVideo = async (id: string): Promise<Video | null> => {
  return db.video.findUnique({
    where: {
      id,
    },
  });
};

export const createVideo = async (
  videoData: Omit<Video, 'id'>
): Promise<Video> => {
  const { title, description, uploadedAt, credits, isPrivate, likes, userId } =
    videoData;
  return db.video.create({
    data: {
      title,
      description,
      uploadedAt: uploadedAt || new Date(),
      credits,
      isPrivate,
      likes,
      userId,
    },
  });
};

export const updateVideo = async (
  id: string,
  videoUpdateData: Partial<Video>
): Promise<Video> => {
  return db.video.update({
    where: {
      id,
    },
    data: videoUpdateData,
  });
};

export const deleteVideo = async (id: string): Promise<void> => {
  await db.video.delete({
    where: {
      id,
    },
  });
};
