import {
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let jwtService: jest.Mocked<JwtService>;
  let reflector: jest.Mocked<Reflector>;

  const mockPayload = { id: '1', username: 'testuser', role: 'user' };

  function makeContext(authHeader?: string): ExecutionContext {
    const request = { headers: { authorization: authHeader }, user: undefined };
    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(request),
      }),
    } as unknown as ExecutionContext;
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        { provide: JwtService, useValue: { verifyAsync: jest.fn() } },
        { provide: Reflector, useValue: { getAllAndOverride: jest.fn() } },
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
    jwtService = module.get(JwtService);
    reflector = module.get(Reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('public routes', () => {
    it('should allow access without a token', async () => {
      reflector.getAllAndOverride.mockReturnValueOnce(true);
      await expect(guard.canActivate(makeContext())).resolves.toBe(true);
      expect(jwtService.verifyAsync).not.toHaveBeenCalled();
    });
  });

  describe('protected routes — token extraction', () => {
    it('should throw UnauthorizedException when Authorization header is missing', async () => {
      reflector.getAllAndOverride.mockReturnValue(false);
      await expect(guard.canActivate(makeContext())).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when token scheme is not Bearer', async () => {
      reflector.getAllAndOverride.mockReturnValue(false);
      await expect(
        guard.canActivate(makeContext('Basic sometoken')),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('protected routes — JWT verification', () => {
    it('should throw UnauthorizedException when JWT is invalid', async () => {
      reflector.getAllAndOverride.mockReturnValue(false);
      jwtService.verifyAsync.mockRejectedValue(new Error('invalid signature'));

      await expect(
        guard.canActivate(makeContext('Bearer bad-token')),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should attach payload to request and return true for a valid token', async () => {
      reflector.getAllAndOverride
        .mockReturnValueOnce(false) // isPublic
        .mockReturnValueOnce(undefined); // requiredRoles
      jwtService.verifyAsync.mockResolvedValue(mockPayload);

      const ctx = makeContext('Bearer valid-token');
      const request = ctx.switchToHttp().getRequest();

      await expect(guard.canActivate(ctx)).resolves.toBe(true);
      expect(request.user).toEqual(mockPayload);
    });
  });

  describe('protected routes — role enforcement', () => {
    it('should return true when user role satisfies required roles', async () => {
      reflector.getAllAndOverride
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(['user', 'admin']);
      jwtService.verifyAsync.mockResolvedValue(mockPayload);

      await expect(
        guard.canActivate(makeContext('Bearer valid-token')),
      ).resolves.toBe(true);
    });

    it('should throw ForbiddenException when user role is insufficient', async () => {
      reflector.getAllAndOverride
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(['admin']);
      jwtService.verifyAsync.mockResolvedValue(mockPayload); // role: 'user'

      await expect(
        guard.canActivate(makeContext('Bearer valid-token')),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException when payload has no role but roles are required', async () => {
      reflector.getAllAndOverride
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(['admin']);
      jwtService.verifyAsync.mockResolvedValue({ id: '1', username: 'testuser' });

      await expect(
        guard.canActivate(makeContext('Bearer valid-token')),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
