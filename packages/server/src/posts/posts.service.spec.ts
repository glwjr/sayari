import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostsService } from './posts.service';
import { Post } from './post.entity';
import { User, UserRole } from 'src/users/user.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { NotFoundException } from '@nestjs/common';

const mockUser: User = {
  id: 'user-1',
  username: 'testuser',
  passwordHash: 'hashedpw',
  createdAt: new Date(),
  updatedAt: new Date(),
  role: UserRole.USER,
  isActive: true,
  posts: [],
  comments: [],
  deletedAt: undefined,
};

const mockPost: Post = {
  id: 'post-1',
  title: 'Test Post',
  content: 'Test Content',
  createdAt: new Date(),
  updatedAt: new Date(),
  user: mockUser,
  userId: mockUser.id,
  comments: [],
  commentCount: 0,
};

describe('PostsService', () => {
  let service: PostsService;
  let postsRepo: jest.Mocked<Repository<Post>>;
  let usersRepo: jest.Mocked<Repository<User>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        {
          provide: getRepositoryToken(Post),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            createQueryBuilder: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            exists: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
    postsRepo = module.get(getRepositoryToken(Post));
    usersRepo = module.get(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a post if user exists', async () => {
      (usersRepo.exists as jest.Mock).mockResolvedValue(true);
      (postsRepo.create as jest.Mock).mockReturnValue(mockPost);
      (postsRepo.save as jest.Mock).mockResolvedValue(mockPost);

      const dto: CreatePostDto = {
        title: 'Test Post',
        content: 'Test Content',
        userId: mockUser.id,
      };

      const result = await service.create(dto);
      expect(usersRepo.exists).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
      expect(postsRepo.create).toHaveBeenCalledWith({
        title: dto.title,
        content: dto.content,
        user: { id: dto.userId },
      });
      expect(postsRepo.save).toHaveBeenCalledWith(mockPost);
      expect(result).toBe(mockPost);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      (usersRepo.exists as jest.Mock).mockResolvedValue(false);

      await expect(
        service.create({
          title: 'Test',
          content: 'Test',
          userId: 'notfound',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return paginated posts', async () => {
      const getMany = jest.fn().mockResolvedValue([mockPost]);
      const qb = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        loadRelationCountAndMap: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany,
      };
      (postsRepo.createQueryBuilder as jest.Mock).mockReturnValue(qb);

      const result = await service.findAll({ page: 1, limit: 10 });
      expect(result).toEqual([mockPost]);
    });
  });

  describe('findHotPosts', () => {
    it('should return posts sorted by commentCount', async () => {
      const postA = { ...mockPost, commentCount: 2 };
      const postB = { ...mockPost, id: 'post-2', commentCount: 5 };
      const getMany = jest.fn().mockResolvedValue([postA, postB]);
      const qb = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        loadRelationCountAndMap: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany,
      };
      (postsRepo.createQueryBuilder as jest.Mock).mockReturnValue(qb);

      const result = await service.findHotPosts({ page: 1, limit: 10 });
      expect(result[0].commentCount ?? 0).toBeGreaterThanOrEqual(
        result[1].commentCount ?? 0,
      );
    });
  });

  describe('findById', () => {
    it('should return a post by id', async () => {
      (postsRepo.findOne as jest.Mock).mockResolvedValue(mockPost);
      const result = await service.findById('post-1');
      expect(postsRepo.findOne).toHaveBeenCalledWith({
        where: { id: 'post-1' },
        relations: ['user', 'comments', 'comments.user'],
        order: { comments: { createdAt: 'DESC' } },
      });
      expect(result).toBe(mockPost);
    });
  });

  describe('findByUserId', () => {
    it('should return posts for a user', async () => {
      const getMany = jest.fn().mockResolvedValue([mockPost]);
      const qb = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        loadRelationCountAndMap: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany,
      };
      (postsRepo.createQueryBuilder as jest.Mock).mockReturnValue(qb);

      const result = await service.findByUserId({
        userId: mockUser.id,
        options: { page: 1, limit: 10 },
      });
      expect(result).toEqual([mockPost]);
    });
  });

  describe('update', () => {
    it('should update a post if found', async () => {
      (service.findById as jest.Mock) = jest
        .fn()
        .mockResolvedValue({ ...mockPost });
      (postsRepo.save as jest.Mock).mockResolvedValue({
        ...mockPost,
        title: 'Updated',
      });

      const dto: UpdatePostDto = { title: 'Updated' };
      const result = await service.update('post-1', dto);
      expect(result.title).toBe('Updated');
    });

    it('should throw NotFoundException if post not found', async () => {
      (service.findById as jest.Mock) = jest.fn().mockResolvedValue(null);

      await expect(service.update('notfound', { title: 'x' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('delete', () => {
    it('should delete post if user is owner', async () => {
      (service.findById as jest.Mock) = jest
        .fn()
        .mockResolvedValue({ ...mockPost });
      (usersRepo.findOne as jest.Mock).mockResolvedValue({
        ...mockUser,
        role: UserRole.USER,
      });
      (postsRepo.delete as jest.Mock).mockResolvedValue(undefined);

      await expect(
        service.delete({ id: mockPost.id, userId: mockUser.id }),
      ).resolves.toBeUndefined();
    });

    it('should delete post if user is admin', async () => {
      (service.findById as jest.Mock) = jest
        .fn()
        .mockResolvedValue({ ...mockPost });
      (usersRepo.findOne as jest.Mock).mockResolvedValue({
        ...mockUser,
        role: UserRole.ADMIN,
      });
      (postsRepo.delete as jest.Mock).mockResolvedValue(undefined);

      await expect(
        service.delete({ id: mockPost.id, userId: mockUser.id }),
      ).resolves.toBeUndefined();
    });

    it('should throw NotFoundException if post not found', async () => {
      (service.findById as jest.Mock) = jest.fn().mockResolvedValue(null);

      await expect(
        service.delete({ id: 'notfound', userId: mockUser.id }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if user not allowed', async () => {
      (service.findById as jest.Mock) = jest
        .fn()
        .mockResolvedValue({ ...mockPost });
      (usersRepo.findOne as jest.Mock).mockResolvedValue({
        ...mockUser,
        id: 'other',
        role: UserRole.USER,
      });

      await expect(
        service.delete({ id: mockPost.id, userId: 'other' }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
