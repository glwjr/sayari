import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserRole } from './user.entity';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: jest.Mocked<UsersService>;

  const mockUser: User = {
    id: '1',
    username: 'testuser',
    passwordHash: 'hashedpw',
    createdAt: new Date(),
    updatedAt: new Date(),
    role: UserRole.USER,
    isActive: true,
    posts: [],
    comments: [],
    postCount: 0,
    deletedAt: undefined,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findById: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const dto: CreateUserDto = { username: 'foo', password: 'bar' };
      usersService.create.mockResolvedValue({
        ...mockUser,
        username: dto.username,
      });
      await expect(controller.create(dto)).resolves.toEqual({
        ...mockUser,
        username: dto.username,
      });
      expect(usersService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      usersService.findAll.mockResolvedValue([mockUser]);
      await expect(controller.findAll()).resolves.toEqual([mockUser]);
      expect(usersService.findAll).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return a user by id', async () => {
      usersService.findById.mockResolvedValue(mockUser);
      await expect(controller.findById('1')).resolves.toEqual(mockUser);
      expect(usersService.findById).toHaveBeenCalledWith('1');
    });
  });

  describe('updateUser', () => {
    it('should update a user', async () => {
      const dto: UpdateUserDto = { username: 'updated' };
      usersService.update.mockResolvedValue({ ...mockUser, ...dto });
      await expect(controller.updateUser('1', dto)).resolves.toEqual({
        ...mockUser,
        ...dto,
      });
      expect(usersService.update).toHaveBeenCalledWith('1', dto);
    });
  });

  describe('delete', () => {
    it('should delete a user', async () => {
      usersService.delete.mockResolvedValue(undefined);
      await expect(controller.delete('1')).resolves.toBeUndefined();
      expect(usersService.delete).toHaveBeenCalledWith('1');
    });
  });
});
