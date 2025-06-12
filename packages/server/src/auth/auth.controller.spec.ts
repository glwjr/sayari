import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    login: jest.fn(),
    register: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should call authService.login and return its result', async () => {
      const dto: LoginDto = { username: 'user', password: 'pw' };
      const result = { access_token: 'token' };
      (authService.login as jest.Mock).mockResolvedValue(result);

      await expect(controller.login(dto)).resolves.toEqual(result);
      expect(authService.login).toHaveBeenCalledWith(dto);
    });
  });

  describe('register', () => {
    it('should call authService.register and return its result', async () => {
      const dto: RegisterDto = { username: 'user', password: 'pw' };
      const result = { access_token: 'token' };
      (authService.register as jest.Mock).mockResolvedValue(result);

      await expect(controller.register(dto)).resolves.toEqual(result);
      expect(authService.register).toHaveBeenCalledWith(dto);
    });
  });

  describe('validate', () => {
    it('should return req.user', () => {
      const req = { user: { id: '1', username: 'user' } };
      expect(controller.validate(req)).toEqual(req.user);
    });
  });

  describe('getProfile', () => {
    it('should return req.user', () => {
      const req = { user: { id: '1', username: 'user' } };
      expect(controller.getProfile(req)).toEqual(req.user);
    });
  });
});
