import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { User, UserRole } from './user.entity';
import { hashPassword } from 'src/auth/auth.util';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ForbiddenException } from '@nestjs/common';

jest.mock('src/auth/auth.util', () => ({
  hashPassword: jest.fn((pw: string) => `hashed-${pw}`),
}));

const userArray: User[] = [
  {
    id: '1',
    username: 'user1',
    passwordHash: 'hashed-password1',
    createdAt: new Date(),
    updatedAt: new Date(),
    role: UserRole.USER,
    isActive: true,
    posts: [],
    deletedAt: undefined,
    comments: [],
  },
  {
    id: '2',
    username: 'admin',
    passwordHash: 'hashed-password2',
    createdAt: new Date(),
    updatedAt: new Date(),
    role: UserRole.ADMIN,
    isActive: true,
    posts: [],
    deletedAt: undefined,
    comments: [],
  },
];

describe('UsersService', () => {
  let service: UsersService;
  let repo: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            save: jest.fn(),
            findOne: jest.fn(),
            findOneBy: jest.fn(),
            createQueryBuilder: jest.fn(() => ({
              loadRelationCountAndMap: jest.fn().mockReturnThis(),
              getMany: jest.fn().mockResolvedValue(userArray),
            })),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repo = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a user', async () => {
    const dto: CreateUserDto = { username: 'test', password: 'pw' };
    (repo.save as jest.Mock).mockResolvedValue({
      ...userArray[0],
      username: dto.username,
    });
    const user = await service.create(dto);
    expect(hashPassword).toHaveBeenCalledWith('pw');
    expect(repo.save).toHaveBeenCalled();
    expect(user.username).toBe('test');
  });

  it('should find user by id with password', async () => {
    (repo.findOne as jest.Mock).mockResolvedValue(userArray[0]);
    const user = await service.findByIdWithPassword('1');
    expect(repo.findOne).toHaveBeenCalledWith({
      where: { id: '1' },
      select: expect.any(Object),
    });
    expect(user).toEqual(userArray[0]);
  });

  it('should find user by username with password', async () => {
    (repo.findOne as jest.Mock).mockResolvedValue(userArray[0]);
    const user = await service.findByUsernameWithPassword('user1');
    expect(repo.findOne).toHaveBeenCalledWith({
      where: { username: 'user1' },
      select: expect.any(Object),
    });
    expect(user).toEqual(userArray[0]);
  });

  it('should find all users', async () => {
    const users = await service.findAll();
    expect(users).toEqual(userArray);
  });

  it('should find user by id', async () => {
    (repo.findOneBy as jest.Mock).mockResolvedValue(userArray[0]);
    const user = await service.findById('1');
    expect(repo.findOneBy).toHaveBeenCalledWith({ id: '1' });
    expect(user).toEqual(userArray[0]);
  });

  it('should find user by username', async () => {
    (repo.findOneBy as jest.Mock).mockResolvedValue(userArray[0]);
    const user = await service.findByUsername('user1');
    expect(repo.findOneBy).toHaveBeenCalledWith({ username: 'user1' });
    expect(user).toEqual(userArray[0]);
  });

  it('should update a user (not admin)', async () => {
    const updateDto: UpdateUserDto = {
      password: 'newpw',
      isActive: false,
      userId: '1',
    };
    (repo.findOneBy as jest.Mock).mockResolvedValue({ ...userArray[0] });
    (repo.update as jest.Mock).mockResolvedValue(undefined);
    (repo.findOneBy as jest.Mock).mockResolvedValueOnce({ ...userArray[0] });
    (repo.findOneBy as jest.Mock).mockResolvedValueOnce({
      ...userArray[0],
      isActive: false,
    });
    const updated = await service.update('1', updateDto);
    expect(hashPassword).toHaveBeenCalledWith('newpw');
    expect(repo.update).toHaveBeenCalled();
    expect(updated).toBeDefined();
  });

  it('should not update admin user', async () => {
    (repo.findOneBy as jest.Mock).mockResolvedValue(userArray[1]);
    await expect(service.update('2', { isActive: false })).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('should delete a user', async () => {
    (repo.findOneBy as jest.Mock)
      .mockResolvedValueOnce(userArray[0])
      .mockResolvedValueOnce(userArray[1]);

    (repo.delete as jest.Mock).mockResolvedValue(undefined);

    await expect(service.delete('1', '2')).resolves.toBeUndefined();
    expect(jest.mocked(repo.delete)).toHaveBeenCalledWith('1');
  });
});
