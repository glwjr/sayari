import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { clearDatabase } from './test-utils';

describe('Users E2E', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let userToken: string;
  let adminToken: string;
  let userId: string;
  let adminId: string;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    dataSource = moduleFixture.get<DataSource>(DataSource);
    await app.init();
    await clearDatabase(dataSource);

    const userRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ username: 'testuser', password: 'password123' });
    userToken = userRes.body.access_token;

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ username: 'admin', password: 'admin123' });

    await dataSource.query(
      `UPDATE "user" SET role = 'admin' WHERE username = 'admin'`,
    );

    const adminLoginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'admin', password: 'admin123' });
    adminToken = adminLoginRes.body.access_token;

    const userProfileRes = await request(app.getHttpServer())
      .get('/auth/profile')
      .set('Authorization', `Bearer ${userToken}`);
    userId = userProfileRes.body.id;

    const adminProfileRes = await request(app.getHttpServer())
      .get('/auth/profile')
      .set('Authorization', `Bearer ${adminToken}`);
    adminId = adminProfileRes.body.id;
  });

  afterAll(async () => {
    await clearDatabase(dataSource);
    await dataSource.destroy();
    await app.close();
  });

  describe('GET /users', () => {
    it('should allow admin to get all users', async () => {
      const res = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body.length).toBe(2);
      expect(res.body[0]).toHaveProperty('username');
      expect(res.body[0]).toHaveProperty('id');
      expect(res.body[0]).toHaveProperty('createdAt');
      expect(res.body[0]).toHaveProperty('role');
      expect(res.body[0]).not.toHaveProperty('passwordHash');
    });

    it('should not allow regular users to get all users', async () => {
      await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });
  });

  describe('GET /users/:id', () => {
    it('should get user by id', async () => {
      const res = await request(app.getHttpServer())
        .get(`/users/${userId}`)
        .expect(200);

      expect(res.body).toHaveProperty('username', 'testuser');
      expect(res.body).toHaveProperty('id', userId);
      expect(res.body).not.toHaveProperty('passwordHash');
    });

    it('should return 400 for non-existent user (invalid UUID)', async () => {
      await request(app.getHttpServer()).get('/users/999999999').expect(400); // UUID validation error
    });
  });

  describe('PATCH /users/:id', () => {
    it('should allow users to update their own profile', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/users/${userId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          username: 'updateduser',
        })
        .expect(200);

      expect(res.body).toHaveProperty('username', 'updateduser');
      expect(res.body).toHaveProperty('id', userId);
    });

    it('should not allow users to update other profiles', async () => {
      const otherUserRes = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ username: 'other', password: 'password123' });

      const otherToken = otherUserRes.body.access_token;
      const otherProfileRes = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${otherToken}`);
      const otherId = otherProfileRes.body.id;

      await request(app.getHttpServer())
        .patch(`/users/${otherId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          username: 'hacked',
        })
        .expect(403);
    });

    it('should allow admin to update any user', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          isActive: false,
        })
        .expect(200);

      expect(res.body).toHaveProperty('isActive', false);
    });
  });

  describe('DELETE /users/:id', () => {
    it('should allow users to delete their own account', async () => {
      // Register a new user
      const selfRes = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ username: 'selfdelete', password: 'password123' });
      const selfToken = selfRes.body.access_token;
      const selfId = (
        await request(app.getHttpServer())
          .get('/auth/profile')
          .set('Authorization', `Bearer ${selfToken}`)
      ).body.id;

      await request(app.getHttpServer())
        .delete(`/users/${selfId}`)
        .set('Authorization', `Bearer ${selfToken}`)
        .expect(204);
    });

    it('should not allow regular users to delete other users', async () => {
      // Register another user
      const otherUserRes = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ username: 'otheruser', password: 'password123' });
      const otherUserId = (
        await request(app.getHttpServer())
          .get('/auth/profile')
          .set('Authorization', `Bearer ${otherUserRes.body.access_token}`)
      ).body.id;

      // Try to delete other user with userToken
      await request(app.getHttpServer())
        .delete(`/users/${otherUserId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('should not allow deleting admin users', async () => {
      await request(app.getHttpServer())
        .delete(`/users/${adminId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(403);
    });

    it('should allow admin to delete regular users', async () => {
      await request(app.getHttpServer())
        .delete(`/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);
    });
  });
});
