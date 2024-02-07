import request from 'supertest';
import { app, startServer, stopServer } from '../../index';
import { db } from '../../config/db.server';
import bcrypt from 'bcrypt';

const validUserData = {
  username: 'testuser',
  email: 'testuser@example.com',
  password: 'ValidPassword1',
};

const createTestUser = async () => {
  const hashedPassword = await bcrypt.hash(validUserData.password, 10);
  await db.user.create({
    data: {
      ...validUserData,
      password: hashedPassword,
    },
  });
};

describe('Auth Router', () => {
  beforeEach(async () => {
    await db.user.deleteMany({});
  });

  beforeAll(async () => {
    process.env.JWT_SECRET = 'some-test-secret';
    await startServer();
  });

  afterAll(async () => {
    delete process.env.JWT_SECRET;
    await stopServer();
  });

  describe('POST /signup', () => {
    it('should return 400 when required fields are missing', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({ username: 'incompleteuser' });
      expect(response.status).toBe(400);
    });

    it('should return 400 when using an existing username', async () => {
      await createTestUser();
      const userData = {
        ...validUserData,
        email: 'differentemail@example.com',
      };
      const response = await request(app)
        .post('/api/auth/signup')
        .send(userData);
      expect(response.status).toBe(400);
    });

    it('should return 400 when using an existing email', async () => {
      await createTestUser();
      const userData = {
        ...validUserData,
        username: 'differentusername',
      };
      const response = await request(app)
        .post('/api/auth/signup')
        .send(userData);
      expect(response.status).toBe(400);
    });

    it('should register a new user and return a token', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send(validUserData);
      expect(response.status).toBe(201);
      expect(response.body.token).toBeDefined();
      expect(response.body.data).toMatchObject({
        username: validUserData.username,
        email: validUserData.email,
      });
    });
  });

  describe('POST /login', () => {
    beforeEach(async () => {
      await createTestUser();
    });

    it('should fail when no user is found', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ identifier: 'nonexistentuser', password: 'password' });
      expect(response.status).toBe(401);
    });

    it('should fail with incorrect password', async () => {
      const response = await request(app).post('/api/auth/login').send({
        identifier: validUserData.username,
        password: 'wrongpassword',
      });
      expect(response.status).toBe(401);
    });

    it('should login successfully with valid credentials', async () => {
      const response = await request(app).post('/api/auth/login').send({
        identifier: validUserData.username,
        password: validUserData.password,
      });
      expect(response.status).toBe(200);
      expect(response.body.user).toMatchObject({
        username: validUserData.username,
        email: validUserData.email,
      });
      expect(response.body.token).toBeDefined();
    });

    it('should fail login with invalid data format', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ identifier: 123, password: ['invalidpassword'] });
      expect(response.status).toBe(400);
    });

    it('should verify the token from login is valid', async () => {
      const loginResponse = await request(app).post('/api/auth/login').send({
        identifier: validUserData.username,
        password: validUserData.password,
      });

      const { token } = loginResponse.body;
      expect(token).toBeDefined();

      const verificationResponse = await request(app)
        .get(`/api/user/${loginResponse.body.user.id}`)
        .set('Authorization', `Bearer ${token}`);
      expect(verificationResponse.status).toBe(200);
    });
  });
});
