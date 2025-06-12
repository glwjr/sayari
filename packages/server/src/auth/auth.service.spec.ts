import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { UserRole } from 'src/users/user.entity';
import { compareHash } from './auth.util';

jest.mock('./auth.util', () => ({
  compareHash: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  const mockUser = {
    id: '1',
    username: 'testuser',
    passwordHash: 'hashedpw',
    createdAt: new Date(),
    updatedAt: new Date(),
    role: UserRole.USER,
    isActive: true,
    posts: [],
    comments: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByUsernameWithPassword: jest.fn(),
            findByUsername: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockImplementation(async function (
              this: void,
              ...args
            ) {
              return 'signed-token';
            }),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
    (jwtService.signAsync as jest.Mock).mockResolvedValue('signed-token');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should throw UnauthorizedException if user not found', async () => {
      usersService.findByUsernameWithPassword.mockResolvedValue(null);
      (compareHash as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ username: 'foo', password: 'bar' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      usersService.findByUsernameWithPassword.mockResolvedValue(mockUser);
      (compareHash as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ username: 'testuser', password: 'wrongpw' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user is inactive', async () => {
      usersService.findByUsernameWithPassword.mockResolvedValue({
        ...mockUser,
        isActive: false,
        role: UserRole.USER,
      });
      (compareHash as jest.Mock).mockResolvedValue(true);

      await expect(
        service.login({ username: 'testuser', password: 'pw' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return AuthResponse if credentials are valid', async () => {
      usersService.findByUsernameWithPassword.mockResolvedValue(mockUser);
      (compareHash as jest.Mock).mockResolvedValue(true);

      const result = await service.login({
        username: 'testuser',
        password: 'pw',
      });

      expect(result).toEqual({ access_token: 'signed-token' });
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        id: mockUser.id,
        username: mockUser.username,
        createdAt: mockUser.createdAt,
        role: mockUser.role,
      });
    });
  });

  describe('register', () => {
    it('should throw ConflictException if username is taken', async () => {
      usersService.findByUsername.mockResolvedValue(mockUser);

      await expect(
        service.register({ username: 'testuser', password: 'pw' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should create user and return AuthResponse if username is free', async () => {
      usersService.findByUsername.mockResolvedValue(null);
      usersService.create.mockResolvedValue(mockUser);

      const result = await service.register({
        username: 'testuser',
        password: 'pw',
      });

      expect(usersService.create).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'pw',
      });
      expect(result).toEqual({ access_token: 'signed-token' });
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        id: mockUser.id,
        username: mockUser.username,
        createdAt: mockUser.createdAt,
        role: mockUser.role,
      });
    });
  });
});
