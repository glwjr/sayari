import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommentsService } from './comments.service';
import { Comment } from './comment.entity';
import { User, UserRole } from 'src/users/user.entity';
import { Post } from 'src/posts/post.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
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

const mockAdmin: User = {
  ...mockUser,
  id: 'admin-1',
  username: 'admin',
  role: UserRole.ADMIN,
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

const mockComment: Comment = {
  id: 'comment-1',
  content: 'Test Comment',
  createdAt: new Date(),
  updatedAt: new Date(),
  user: mockUser,
  userId: mockUser.id,
  post: mockPost,
  postId: mockPost.id,
};

describe('CommentsService', () => {
  let service: CommentsService;
  let commentsRepo: jest.Mocked<Repository<Comment>>;
  let usersRepo: jest.Mocked<Repository<User>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        {
          provide: getRepositoryToken(Comment),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
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

    service = module.get<CommentsService>(CommentsService);
    commentsRepo = module.get(getRepositoryToken(Comment));
    usersRepo = module.get(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a comment if user exists', async () => {
      (usersRepo.exists as jest.Mock).mockResolvedValue(true);
      (commentsRepo.create as jest.Mock).mockReturnValue(mockComment);
      (commentsRepo.save as jest.Mock).mockResolvedValue(mockComment);

      const dto: CreateCommentDto = {
        content: 'Test Comment',
        userId: mockUser.id,
        postId: mockPost.id,
      };

      const result = await service.create(dto);
      expect(usersRepo.exists).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
      expect(commentsRepo.create).toHaveBeenCalledWith({
        content: dto.content,
        user: { id: dto.userId },
        post: { id: dto.postId },
      });
      expect(commentsRepo.save).toHaveBeenCalledWith(mockComment);
      expect(result).toBe(mockComment);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      (usersRepo.exists as jest.Mock).mockResolvedValue(false);

      await expect(
        service.create({
          content: 'Test',
          userId: 'notfound',
          postId: mockPost.id,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findById', () => {
    it('should return a comment by id', async () => {
      (commentsRepo.findOne as jest.Mock).mockResolvedValue(mockComment);
      const result = await service.findById(mockComment.id);
      expect(commentsRepo.findOne).toHaveBeenCalledWith({
        where: { id: mockComment.id },
        relations: ['user'],
        select: {
          user: {
            id: true,
            username: true,
          },
        },
      });
      expect(result).toBe(mockComment);
    });
  });

  describe('findByUserId', () => {
    it('should return comments by userId', async () => {
      (commentsRepo.find as jest.Mock).mockResolvedValue([mockComment]);
      const result = await service.findByUserId(mockUser.id);
      expect(commentsRepo.find).toHaveBeenCalledWith({
        where: { user: { id: mockUser.id } },
      });
      expect(result).toEqual([mockComment]);
    });
  });

  describe('findByPostId', () => {
    it('should return comments by postId', async () => {
      (commentsRepo.find as jest.Mock).mockResolvedValue([mockComment]);
      const result = await service.findByPostId(mockPost.id);
      expect(commentsRepo.find).toHaveBeenCalledWith({
        where: { post: { id: mockPost.id } },
      });
      expect(result).toEqual([mockComment]);
    });
  });

  describe('update', () => {
    it('should update a comment', async () => {
      (service.findById as jest.Mock) = jest
        .fn()
        .mockResolvedValue(mockComment);
      (commentsRepo.save as jest.Mock).mockResolvedValue({
        ...mockComment,
        content: 'Updated',
      });

      const dto: UpdateCommentDto = {
        content: 'Updated',
        userId: mockUser.id,
        postId: mockPost.id,
      };

      const result = await service.update(mockComment.id, dto);
      expect(result.content).toBe('Updated');
      expect(commentsRepo.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if comment not found', async () => {
      (service.findById as jest.Mock) = jest.fn().mockResolvedValue(null);

      await expect(
        service.update('notfound', {
          content: 'Updated',
          userId: mockUser.id,
          postId: mockPost.id,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete comment if user is owner', async () => {
      (service.findById as jest.Mock) = jest
        .fn()
        .mockResolvedValue(mockComment);
      (usersRepo.findOne as jest.Mock).mockResolvedValue(mockUser);
      (commentsRepo.delete as jest.Mock).mockResolvedValue(undefined);

      await expect(
        service.delete({ id: mockComment.id, userId: mockUser.id }),
      ).resolves.toBeUndefined();
      expect(commentsRepo.delete).toHaveBeenCalledWith(mockComment.id);
    });

    it('should delete comment if user is admin', async () => {
      (service.findById as jest.Mock) = jest
        .fn()
        .mockResolvedValue(mockComment);
      (usersRepo.findOne as jest.Mock).mockResolvedValue(mockAdmin);
      (commentsRepo.delete as jest.Mock).mockResolvedValue(undefined);

      await expect(
        service.delete({ id: mockComment.id, userId: mockAdmin.id }),
      ).resolves.toBeUndefined();
      expect(commentsRepo.delete).toHaveBeenCalledWith(mockComment.id);
    });

    it('should throw NotFoundException if comment not found', async () => {
      (service.findById as jest.Mock) = jest.fn().mockResolvedValue(null);

      await expect(
        service.delete({ id: 'notfound', userId: mockUser.id }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if user is not owner or admin', async () => {
      (service.findById as jest.Mock) = jest
        .fn()
        .mockResolvedValue(mockComment);
      (usersRepo.findOne as jest.Mock).mockResolvedValue({
        ...mockUser,
        id: 'other-user',
        role: UserRole.USER,
      });

      await expect(
        service.delete({ id: mockComment.id, userId: 'other-user' }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
