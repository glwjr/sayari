import { Test, TestingModule } from '@nestjs/testing';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Comment } from './comment.entity';
import { User, UserRole } from 'src/users/user.entity';

describe('CommentsController', () => {
  let controller: CommentsController;
  let commentsService: jest.Mocked<CommentsService>;

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

  const mockComment: Comment = {
    id: 'comment-1',
    content: 'Test Comment',
    createdAt: new Date(),
    updatedAt: new Date(),
    user: mockUser,
    userId: mockUser.id,
    post: { id: 'post-1' } as any,
    postId: 'post-1',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentsController],
      providers: [
        {
          provide: CommentsService,
          useValue: {
            create: jest.fn(),
            findByPostId: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CommentsController>(CommentsController);
    commentsService = module.get(CommentsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a comment', async () => {
      const dto: CreateCommentDto = {
        content: 'Test Comment',
        userId: mockUser.id,
        postId: mockComment.postId,
      };
      (commentsService.create as jest.Mock).mockResolvedValue(mockComment);

      await expect(controller.create(dto)).resolves.toEqual(mockComment);
      expect(commentsService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('getCommentsByPostId', () => {
    it('should return comments for a post', async () => {
      (commentsService.findByPostId as jest.Mock).mockResolvedValue([
        mockComment,
      ]);
      await expect(
        controller.getCommentsByPostId(mockComment.postId),
      ).resolves.toEqual([mockComment]);
      expect(commentsService.findByPostId).toHaveBeenCalledWith(
        mockComment.postId,
      );
    });
  });

  describe('delete', () => {
    it('should delete a comment', async () => {
      (commentsService.delete as jest.Mock).mockResolvedValue(undefined);
      const req = { user: { id: mockUser.id } };
      await expect(
        controller.delete(mockComment.id, req),
      ).resolves.toBeUndefined();
      expect(commentsService.delete).toHaveBeenCalledWith({
        id: mockComment.id,
        userId: mockUser.id,
      });
    });
  });
});
