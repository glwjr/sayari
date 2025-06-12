import { Test, TestingModule } from '@nestjs/testing';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './post.entity';
import { User, UserRole } from 'src/users/user.entity';

describe('PostsController', () => {
  let controller: PostsController;
  let postsService: jest.Mocked<PostsService>;

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [
        {
          provide: PostsService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findHotPosts: jest.fn(),
            findById: jest.fn(),
            findByUserId: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<PostsController>(PostsController);
    postsService = module.get(PostsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createPost', () => {
    it('should create a post', async () => {
      const dto: CreatePostDto = {
        title: 'Test Post',
        content: 'Test Content',
        userId: mockUser.id,
      };
      (postsService.create as jest.Mock).mockResolvedValue(mockPost);

      await expect(controller.createPost(dto)).resolves.toEqual(mockPost);
      expect(postsService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('getAllPosts', () => {
    it('should return all posts', async () => {
      (postsService.findAll as jest.Mock).mockResolvedValue([mockPost]);
      await expect(controller.getAllPosts('1', '10')).resolves.toEqual([
        mockPost,
      ]);
      expect(postsService.findAll).toHaveBeenCalledWith({ page: 1, limit: 10 });
    });

    it('should return posts by userId', async () => {
      (postsService.findByUserId as jest.Mock).mockResolvedValue([mockPost]);
      await expect(
        controller.getAllPosts('1', '10', mockUser.id),
      ).resolves.toEqual([mockPost]);
      expect(postsService.findByUserId).toHaveBeenCalledWith({
        userId: mockUser.id,
        options: { page: 1, limit: 10 },
      });
    });
  });

  describe('getHotPosts', () => {
    it('should return hot posts', async () => {
      (postsService.findHotPosts as jest.Mock).mockResolvedValue([mockPost]);
      await expect(controller.getHotPosts('1', '10')).resolves.toEqual([
        mockPost,
      ]);
      expect(postsService.findHotPosts).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
      });
    });
  });

  describe('getPostById', () => {
    it('should return a post by id', async () => {
      (postsService.findById as jest.Mock).mockResolvedValue(mockPost);
      await expect(controller.getPostById(mockPost.id)).resolves.toEqual(
        mockPost,
      );
      expect(postsService.findById).toHaveBeenCalledWith(mockPost.id);
    });
  });

  describe('update', () => {
    it('should update a post', async () => {
      const dto: UpdatePostDto = { title: 'Updated Title' };
      (postsService.update as jest.Mock).mockResolvedValue({
        ...mockPost,
        ...dto,
      });
      await expect(controller.update(mockPost.id, dto)).resolves.toEqual({
        ...mockPost,
        ...dto,
      });
      expect(postsService.update).toHaveBeenCalledWith(mockPost.id, dto);
    });
  });

  describe('delete', () => {
    it('should delete a post', async () => {
      (postsService.delete as jest.Mock).mockResolvedValue(undefined);
      const req = { user: { id: mockUser.id } };
      await expect(
        controller.delete(mockPost.id, req),
      ).resolves.toBeUndefined();
      expect(postsService.delete).toHaveBeenCalledWith({
        id: mockPost.id,
        userId: mockUser.id,
      });
    });
  });
});
