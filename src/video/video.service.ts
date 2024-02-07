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
export const listVideos = async (userId?: number): Promise<Video[]> => {
  if (userId) {
    // If user is authenticated, return both public videos and the user's private videos
    return db.video.findMany({
      where: {
        OR: [{ isPrivate: false }, { userId }],
      },
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
  } else {
    // If user is not authenticated, return only the public videos
    return db.video.findMany({
      where: {
        isPrivate: false,
      },
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
  }
};

export const listAllVideos = async (): Promise<Video[]> => {
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
  const video = await db.video.findUnique({
    where: {
      id,
    },
  });
  return video;
};

export const createVideo = async (
  videoData: Omit<Video, 'id' | 'userId'>,
  userId: number
): Promise<Video> => {
  return db.video.create({
    data: {
      ...videoData,
      uploadedAt: new Date(),
      userId,
    },
  });
};

export const updateVideo = async (
  id: string,
  videoUpdateData: Omit<Video, 'id'>
): Promise<Video> => {
  const existingVideo = await db.video.findUnique({
    where: { id },
  });

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
