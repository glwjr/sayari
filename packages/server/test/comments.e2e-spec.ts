import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { clearDatabase } from './test-utils';

describe('Comments E2E', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let accessToken: string;
  let userId: string;
  let postId: string;
  let commentId: string;

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

    const postRes = await request(app.getHttpServer())
      .post('/posts')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ title: 'Post for comments', content: '...', userId });

    postId = postRes.body.id;
  });

  afterAll(async () => {
    await clearDatabase(dataSource);
    await dataSource.destroy();
    await app.close();
  });

  it('should add a comment to a post', async () => {
    const res = await request(app.getHttpServer())
      .post(`/posts/${postId}/comments`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        content: 'Nice post!',
        userId,
        postId,
      })
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('content', 'Nice post!');
    commentId = res.body.id;
  });

  it('should get comments for a post', async () => {
    return request(app.getHttpServer())
      .get(`/posts/${postId}/comments`)
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.some((c: any) => c.id === commentId)).toBe(true);
      });
  });

  it('should delete a comment', async () => {
    return request(app.getHttpServer())
      .delete(`/posts/${postId}/comments/${commentId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(204);
  });
});
