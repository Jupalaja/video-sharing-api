import request from 'supertest';
import { app, startServer, stopServer } from '../../index';
import { db } from '../../config/db.server';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { Video } from '../video.service';

const validUserData = {
  username: 'videotester',
  email: 'videotester@example.com',
  password: 'VideoTest1',
};

const createTestUser = async () => {
  const hashedPassword = await bcrypt.hash(validUserData.password, 10);
  return await db.user.create({
    data: {
      ...validUserData,
      password: hashedPassword,
    },
  });
};

const createTestVideo = async (userId: number, isPrivate: boolean = false) => {
  return await db.video.create({
    data: {
      userId: userId,
      title: 'Test Video',
      description: 'A description of the test video',
      credits: 'Test Credits',
      isPrivate: isPrivate,
    },
  });
};

describe('Video Router', () => {
  let testUser: any;
  let testVideo: any;
  let authToken: string;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-secret';
    await startServer();
  });

  beforeEach(async () => {
    await db.$transaction([db.video.deleteMany({}), db.user.deleteMany({})]);
    testUser = await createTestUser();
    testVideo = await createTestVideo(testUser.id);
    const loginRes = await request(app).post('/api/auth/login').send({
      identifier: validUserData.username,
      password: validUserData.password,
    });
    authToken = loginRes.body.token;
  });

  afterAll(async () => {
    delete process.env.JWT_SECRET;
    await stopServer();
  });

  describe('GET /api/video/', () => {
    it('should return all public videos', async () => {
      const response = await request(app).get('/api/video/');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      response.body.data.forEach((video: Video) => {
        expect(video.isPrivate).toBe(false);
      });
    });

    it('should return all videos including private for the logged-in user', async () => {
      await createTestVideo(testUser.id, true);
      const response = await request(app)
        .get('/api/video/')
        .set('Authorization', `Bearer ${authToken}`);
      expect(response.status).toBe(200);
      expect(response.body.data.some((video: Video) => video.isPrivate)).toBe(
        true
      );
    });
  });

  describe('GET /api/video/:id', () => {
    it('should return a video if the video is public', async () => {
      const response = await request(app).get(`/api/video/${testVideo.id}`);
      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(testVideo.id);
    });

    it('should return 404 if the video does not exist', async () => {
      const response = await request(app).get(`/api/video/${uuidv4()}`);
      expect(response.status).toBe(404);
    });

    it('should return a private video if the user owns the video', async () => {
      const privateVideo = await createTestVideo(testUser.id, true);
      const response = await request(app)
        .get(`/api/video/${privateVideo.id}`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(privateVideo.id);
    });

    it('should return 403 for a private video if the user does not own the video', async () => {
      const privateVideo = await createTestVideo(testUser.id, true);
      const response = await request(app)
        .get(`/api/video/${privateVideo.id}`)
        .set('Authorization', `Bearer ANOTHER_USER_TOKEN`);
      expect(response.status).toBe(403);
    });
  });

  describe('POST /api/video/', () => {
    it('should allow an authenticated user to upload a video', async () => {
      const response = await request(app)
        .post('/api/video/')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'New Video',
          description: 'New video description',
          credits: 'Some Credits',
          isPrivate: false,
        });
      expect(response.status).toBe(201);
      expect(response.body.data.title).toBe('New Video');
    });

    it('should return 401 when an unauthenticated user tries to upload a video', async () => {
      const response = await request(app).post('/api/video/').send({
        title: 'New Video',
        description: 'New video description',
        credits: 'Some Credits',
        isPrivate: false,
      });
      expect(response.status).toBe(401);
    });
  });

  describe('PUT /api/video/:id', () => {
    it('should allow an authenticated user to update their video', async () => {
      const response = await request(app)
        .put(`/api/video/${testVideo.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Video',
        });
      expect(response.status).toBe(200);
      expect(response.body.data.title).toBe('Updated Video');
    });

    it("should return 403 if a user tries to update another user's video", async () => {
      const response = await request(app)
        .put(`/api/video/${testVideo.id}`)
        .set('Authorization', `Bearer ANOTHER_USER_TOKEN`)
        .send({
          title: 'Updated Video Attempt by Different User',
        });
      expect(response.status).toBe(400);
    });

    it('should return 404 if a user tries to update a non-existing video', async () => {
      const response = await request(app)
        .put(`/api/video/${uuidv4()}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Non-Existing Video',
        });
      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/video/:id', () => {
    it('should allow an authenticated user to delete their video', async () => {
      const response = await request(app)
        .delete(`/api/video/${testVideo.id}`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(response.status).toBe(200);
    });

    it("should return 403 if a user tries to delete another user's video", async () => {
      const response = await request(app)
        .delete(`/api/video/${testVideo.id}`)
        .set('Authorization', `Bearer ANOTHER_USER_TOKEN`);
      expect(response.status).toBe(400);
    });

    it('should return 404 if a user tries to delete a non-existing video', async () => {
      const response = await request(app)
        .delete(`/api/video/${uuidv4()}`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/video/:id/like', () => {
    it('should allow adding a like to a video', async () => {
      const response = await request(app).post(
        `/api/video/${testVideo.id}/like`
      );
      expect(response.status).toBe(200);
      expect(response.body.message).toContain(
        'Like was successfully added to the video'
      );
      expect(response.body.data.likes).toBe(1);
    });
  });

  describe('DELETE /api/video/:id/like', () => {
    it('should allow removing a like from a video', async () => {
      await db.video.update({
        where: { id: testVideo.id },
        data: { likes: 1 },
      });

      const response = await request(app).delete(
        `/api/video/${testVideo.id}/like`
      );
      expect(response.status).toBe(200);
      expect(response.body.message).toContain(
        'Like was successfully removed from the video'
      );
      expect(response.body.data.likes).toBe(0);
    });
  });
});
