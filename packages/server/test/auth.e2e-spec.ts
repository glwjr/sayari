import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { config } from 'dotenv';
import { resolve } from 'path';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { clearDatabase } from './test-utils';

config({ path: resolve(__dirname, '../.env.test') });

describe('Auth E2E', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  const testUser = {
    username: 'testuser',
    password: 'password123',
  };
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    dataSource = moduleFixture.get<DataSource>(DataSource);
    await app.init();
    await clearDatabase(dataSource);
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });

  describe('Registration', () => {
    it('should register a new user', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          expect(typeof res.body.access_token).toBe('string');
        });
    });

    it('should fail registering with existing username', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(409);
    });

    it('should fail registering with missing fields', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({ username: 'test' })
        .expect(400);
    });
  });

  describe('Authentication', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(testUser)
        .expect(200);

      expect(response.body).toHaveProperty('access_token');
      authToken = response.body.access_token;
    });

    it('should fail login with invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: testUser.username, password: 'wrongpassword' })
        .expect(401);
    });
  });

  describe('Protected Routes', () => {
    it('should access protected route with valid token', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('username', testUser.username);
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('role');
        });
    });

    it('should fail accessing protected route without token', () => {
      return request(app.getHttpServer()).get('/auth/profile').expect(401);
    });

    it('should fail accessing protected route with invalid token', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('Token Validation', () => {
    it('should validate a valid token', () => {
      return request(app.getHttpServer())
        .get('/auth/validate')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('username', testUser.username);
          expect(res.body).toHaveProperty('id');
        });
    });

    it('should fail validating an invalid token', () => {
      return request(app.getHttpServer())
        .get('/auth/validate')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });
});
