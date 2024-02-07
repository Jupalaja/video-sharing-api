import request from 'supertest';
import bcrypt from 'bcrypt';
import { app, startServer, stopServer } from '../../index';
import { db } from '../../config/db.server';

const validUserData = {
  username: 'testuser',
  email: 'testuser@example.com',
  password: 'ValidPassword1',
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

describe('User Router', () => {
  let testUser: any;

  beforeEach(async () => {
    await db.user.deleteMany({});
    testUser = await createTestUser();
  });

  beforeAll(async () => {
    process.env.JWT_SECRET = 'some-test-secret';
    await startServer();
  });

  afterAll(async () => {
    delete process.env.JWT_SECRET;
    await stopServer();
  });

  describe('GET /api/user/:id', () => {
    it('should return 404 if user does not exist', async () => {
      const response = await request(app).get('/api/user/9999');
      expect(response.status).toBe(404);
    });

    it('should return user data for a valid user id', async () => {
      const response = await request(app).get(`/api/user/${testUser.id}`);
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('id', testUser.id);
      expect(response.body.data).toHaveProperty('username', testUser.username);
      expect(response.body.data).toHaveProperty('email', testUser.email);
    });
  });

  describe('PUT /api/user/:id', () => {
    it('should return 400 if not authorized', async () => {
      const response = await request(app)
        .put(`/api/user/${testUser.id}`)
        .send({ password: 'newSecretPass123' });
      expect(response.status).toBe(401);
    });

    it('should update password if authorized', async () => {
      const loginResponse = await request(app).post('/api/auth/login').send({
        identifier: validUserData.username,
        password: validUserData.password,
      });

      const { token } = loginResponse.body;
      const response = await request(app)
        .put(`/api/user/${testUser.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ password: 'newSecretPass123' });
      expect(response.status).toBe(200);
      expect(response.body.message).toContain('successfully updated');
    });
  });

  describe('DELETE /api/user/:id', () => {
    it('should return 400 if not authorized', async () => {
      const response = await request(app).delete(`/api/user/${testUser.id}`);
      expect(response.status).toBe(401);
    });

    it('should delete user if authorized', async () => {
      const loginResponse = await request(app).post('/api/auth/login').send({
        identifier: validUserData.username,
        password: validUserData.password,
      });

      const { token } = loginResponse.body;
      const response = await request(app)
        .delete(`/api/user/${testUser.id}`)
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(200);
      expect(response.body.message).toContain('successfully deleted');
    });
  });
});
