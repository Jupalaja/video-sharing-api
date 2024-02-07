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

export const listVideos = async (
  userId?: number,
  sort?: 'likes' | 'title',
  order: 'asc' | 'desc' = 'asc'
): Promise<Video[]> => {
  let orderByArgs: Record<string, 'asc' | 'desc'> | {} = {};
  if (sort) {
    orderByArgs = {
      [sort]: order,
    };
  }
  if (userId) {
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
      orderBy: orderByArgs,
    });
  } else {
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
      orderBy: orderByArgs,
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

export const addLikeToVideo = async (id: string): Promise<Video> => {
  const video = await getVideo(id);
  if (!video) {
    throw new Error('Video not found');
  }
  return db.video.update({
    where: { id },
    data: {
      likes: {
        increment: 1,
      },
    },
  });
};

export const removeLikeFromVideo = async (id: string): Promise<Video> => {
  const video = await getVideo(id);
  if (!video) {
    throw new Error('Video not found');
  }
  if (video.likes > 0) {
    return db.video.update({
      where: { id },
      data: {
        likes: {
          decrement: 1,
        },
      },
    });
  } else {
    return video;
  }
};
