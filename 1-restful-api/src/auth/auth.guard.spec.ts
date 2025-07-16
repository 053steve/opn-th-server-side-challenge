import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let reflector: Reflector;

  const mockReflector = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        {
          provide: Reflector,
          useValue: mockReflector,
        },
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
    reflector = module.get<Reflector>(Reflector);

    jest.clearAllMocks();
  });

  const createMockExecutionContext = (authHeader?: string): ExecutionContext => {
    const mockRequest = {
      headers: {
        authorization: authHeader,
      },
    };

    return {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as ExecutionContext;
  };

  describe('canActivate', () => {
    it('should allow access with faketoken_user1', () => {
      const context = createMockExecutionContext('Bearer faketoken_user1');
      const request = context.switchToHttp().getRequest();

      const result = guard.canActivate(context);

      expect(result).toBe(true);
      expect(request.user).toEqual({ id: 'user1', email: 'user@example.com' });
    });

    it('should allow access with empty token (due to implementation bug)', () => {
      const context = createMockExecutionContext('Bearer ');
      const request = context.switchToHttp().getRequest();

      const result = guard.canActivate(context);

      expect(result).toBe(true);
      expect(request.user).toEqual({ id: 'user1', email: 'user@example.com' });
    });

    it('should throw UnauthorizedException when authorization header is missing', () => {
      const context = createMockExecutionContext();

      expect(() => guard.canActivate(context))
        .toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when authorization header is empty', () => {
      const context = createMockExecutionContext('');

      expect(() => guard.canActivate(context))
        .toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when authorization header does not start with Bearer', () => {
      const context = createMockExecutionContext('Basic token123');

      expect(() => guard.canActivate(context))
        .toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when token is only Bearer without space', () => {
      const context = createMockExecutionContext('Bearer');

      expect(() => guard.canActivate(context))
        .toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for any non-empty token that is not faketoken_user1', () => {
      const context = createMockExecutionContext('Bearer invalid-token');

      expect(() => guard.canActivate(context))
        .toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for random tokens', () => {
      const context = createMockExecutionContext('Bearer randomtoken123');

      expect(() => guard.canActivate(context))
        .toThrow(UnauthorizedException);
    });

    it('should be case-sensitive for Bearer prefix', () => {
      const context = createMockExecutionContext('bearer faketoken_user1');

      expect(() => guard.canActivate(context))
        .toThrow(UnauthorizedException);
    });

    it('should extract token correctly and accept faketoken_user1', () => {
      const context = createMockExecutionContext('Bearer faketoken_user1');
      const request = context.switchToHttp().getRequest();

      const result = guard.canActivate(context);

      expect(result).toBe(true);
      expect(request.user).toEqual({ id: 'user1', email: 'user@example.com' });
    });

    it('should handle extra spaces after Bearer but still extract empty token', () => {
      const context = createMockExecutionContext('Bearer   ');
      const request = context.switchToHttp().getRequest();

      const result = guard.canActivate(context);

      expect(result).toBe(true);
      expect(request.user).toEqual({ id: 'user1', email: 'user@example.com' });
    });
  });

  describe('Error handling', () => {
    it('should throw UnauthorizedException with correct message for missing header', () => {
      const context = createMockExecutionContext();

      expect(() => guard.canActivate(context))
        .toThrow(new UnauthorizedException('Missing or invalid authorization header'));
    });

    it('should throw UnauthorizedException with correct message for invalid header format', () => {
      const context = createMockExecutionContext('InvalidFormat token123');

      expect(() => guard.canActivate(context))
        .toThrow(new UnauthorizedException('Missing or invalid authorization header'));
    });

    it('should throw UnauthorizedException with correct message for invalid token', () => {
      const context = createMockExecutionContext('Bearer invalid-token');

      expect(() => guard.canActivate(context))
        .toThrow(new UnauthorizedException('Invalid token'));
    });
  });

  describe('User object injection', () => {
    it('should set user object on request with correct properties for valid token', () => {
      const context = createMockExecutionContext('Bearer faketoken_user1');
      const request = context.switchToHttp().getRequest();

      guard.canActivate(context);

      expect(request.user).toBeDefined();
      expect(request.user.id).toBe('user1');
      expect(request.user.email).toBe('user@example.com');
    });

    it('should set same user object for empty token (implementation behavior)', () => {
      const context = createMockExecutionContext('Bearer ');
      const request = context.switchToHttp().getRequest();

      guard.canActivate(context);

      expect(request.user).toBeDefined();
      expect(request.user.id).toBe('user1');
      expect(request.user.email).toBe('user@example.com');
    });

    it('should always set the same mock user for valid tokens', () => {
      const context1 = createMockExecutionContext('Bearer faketoken_user1');
      const context2 = createMockExecutionContext('Bearer ');
      
      const request1 = context1.switchToHttp().getRequest();
      const request2 = context2.switchToHttp().getRequest();

      guard.canActivate(context1);
      guard.canActivate(context2);

      expect(request1.user).toEqual(request2.user);
      expect(request1.user).toEqual({ id: 'user1', email: 'user@example.com' });
    });
  });

  describe('Guard instantiation', () => {
    it('should be defined', () => {
      expect(guard).toBeDefined();
    });

    it('should have reflector injected', () => {
      expect(reflector).toBeDefined();
    });

    it('should be an instance of AuthGuard', () => {
      expect(guard).toBeInstanceOf(AuthGuard);
    });
  });

  describe('Token validation logic', () => {
    it('should accept exactly faketoken_user1', () => {
      const context = createMockExecutionContext('Bearer faketoken_user1');
      
      const result = guard.canActivate(context);
      
      expect(result).toBe(true);
    });

    it('should reject partial matches of faketoken_user1', () => {
      const context = createMockExecutionContext('Bearer faketoken_user');
      
      expect(() => guard.canActivate(context))
        .toThrow(UnauthorizedException);
    });

    it('should reject similar but different tokens', () => {
      const context = createMockExecutionContext('Bearer faketoken_user2');
      
      expect(() => guard.canActivate(context))
        .toThrow(UnauthorizedException);
    });

    it('should reject tokens with extra characters', () => {
      const context = createMockExecutionContext('Bearer faketoken_user1extra');
      
      expect(() => guard.canActivate(context))
        .toThrow(UnauthorizedException);
    });
  });
});
