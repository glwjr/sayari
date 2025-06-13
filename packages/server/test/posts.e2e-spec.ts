import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { clearDatabase } from './test-utils';

describe('Posts E2E', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let accessToken: string;
  let userId: string;
  let postId: string;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    dataSource = moduleFixture.get<DataSource>(DataSource);

    await app.init();
    await clearDatabase(dataSource);

    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ username: 'poster', password: 'password123' });

    accessToken = res.body.access_token;

    const profileRes = await request(app.getHttpServer())
      .get('/auth/profile')
      .set('Authorization', `Bearer ${accessToken}`);

    userId = profileRes.body.id;
  });

  afterAll(async () => {
    await clearDatabase(dataSource);
    await dataSource.destroy();
    await app.close();
  });

  it('should create a post', async () => {
    const res = await request(app.getHttpServer())
      .post('/posts')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ title: 'Test Post', content: 'Hello world', userId: userId })
      .expect(201);

    postId = res.body.id;
  });

  it('should get all posts', async () => {
    return request(app.getHttpServer())
      .get('/posts')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });

  it('should get a single post by ID', async () => {
    return request(app.getHttpServer())
      .get(`/posts/${postId}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('id', postId);
      });
  });
});
