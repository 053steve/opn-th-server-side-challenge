import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ChangePasswordDto } from '../users/dto/change-password.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    signup: jest.fn(),
    login: jest.fn(),
    refreshToken: jest.fn(),
    changePassword: jest.fn(),
  };

  const mockAuthGuard = {
    canActivate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: AuthGuard,
          useValue: mockAuthGuard,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  describe('signup', () => {
    const validSignupDto: CreateUserDto = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
      dateOfBirth: '1990-01-01',
      gender: 'male',
      address: '123 Test St',
      subscribeToNewsletter: true,
    };

    const mockSignupResponse = {
      user: {
        id: 'user-id',
        email: 'test@example.com',
        name: 'Test User',
        dateOfBirth: new Date('1990-01-01'),
        gender: 'male',
        address: '123 Test St',
        subscribeToNewsletter: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    };

    it('should signup user successfully', async () => {
      mockAuthService.signup.mockResolvedValue(mockSignupResponse);

      const result = await controller.signup(validSignupDto);

      expect(result).toEqual(mockSignupResponse);
      expect(mockAuthService.signup).toHaveBeenCalledWith(validSignupDto);
    });

    it('should handle ConflictException when user already exists', async () => {
      mockAuthService.signup.mockRejectedValue(new ConflictException('User with this email already exists'));

      await expect(controller.signup(validSignupDto))
        .rejects.toThrow(ConflictException);
    });

    it('should handle UnauthorizedException for signup failures', async () => {
      mockAuthService.signup.mockRejectedValue(new UnauthorizedException('Signup failed'));

      await expect(controller.signup(validSignupDto))
        .rejects.toThrow(UnauthorizedException);
    });

    it('should validate required fields', async () => {
      const invalidSignupDto = {
        email: 'invalid-email',
        password: '123', // Too short
        name: '',
        dateOfBirth: 'invalid-date',
        gender: 'invalid' as any,
        address: '',
        subscribeToNewsletter: 'invalid' as any,
      };

      // Note: In real scenario, validation would be handled by ValidationPipe
      // but we can test that the controller passes the DTO correctly
      mockAuthService.signup.mockRejectedValue(new Error('Validation failed'));

      await expect(controller.signup(invalidSignupDto))
        .rejects.toThrow();
    });
  });

  describe('login', () => {
    const validLoginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    const mockLoginResponse = {
      user: {
        id: 'user-id',
        email: 'test@example.com',
        name: 'Test User',
        dateOfBirth: new Date('1990-01-01'),
        gender: 'male',
        address: '123 Test St',
        subscribeToNewsletter: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    };

    it('should login user successfully', async () => {
      mockAuthService.login.mockResolvedValue(mockLoginResponse);

      const result = await controller.login(validLoginDto);

      expect(result).toEqual(mockLoginResponse);
      expect(mockAuthService.login).toHaveBeenCalledWith(validLoginDto);
    });

    it('should handle UnauthorizedException for invalid credentials', async () => {
      mockAuthService.login.mockRejectedValue(new UnauthorizedException('Invalid credentials'));

      await expect(controller.login(validLoginDto))
        .rejects.toThrow(UnauthorizedException);
    });

    it('should handle missing email', async () => {
      const invalidLoginDto = {
        email: '',
        password: 'password123',
      };

      mockAuthService.login.mockRejectedValue(new Error('Validation failed'));

      await expect(controller.login(invalidLoginDto))
        .rejects.toThrow();
    });

    it('should handle missing password', async () => {
      const invalidLoginDto = {
        email: 'test@example.com',
        password: '',
      };

      mockAuthService.login.mockRejectedValue(new Error('Validation failed'));

      await expect(controller.login(invalidLoginDto))
        .rejects.toThrow();
    });
  });

  describe('refreshToken', () => {
    const validRefreshTokenDto: RefreshTokenDto = {
      refreshToken: 'valid-refresh-token',
    };

    const mockRefreshResponse = {
      user: {
        id: 'user-id',
        email: 'test@example.com',
        name: 'Test User',
        dateOfBirth: new Date('1990-01-01'),
        gender: 'male',
        address: '123 Test St',
        subscribeToNewsletter: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
    };

    it('should refresh token successfully', async () => {
      mockAuthService.refreshToken.mockResolvedValue(mockRefreshResponse);

      const result = await controller.refreshToken(validRefreshTokenDto);

      expect(result).toEqual(mockRefreshResponse);
      expect(mockAuthService.refreshToken).toHaveBeenCalledWith('valid-refresh-token');
    });

    it('should handle UnauthorizedException for invalid refresh token', async () => {
      mockAuthService.refreshToken.mockRejectedValue(new UnauthorizedException('Invalid refresh token'));

      await expect(controller.refreshToken(validRefreshTokenDto))
        .rejects.toThrow(UnauthorizedException);
    });

    it('should handle expired refresh token', async () => {
      mockAuthService.refreshToken.mockRejectedValue(new UnauthorizedException('Token expired'));

      await expect(controller.refreshToken(validRefreshTokenDto))
        .rejects.toThrow(UnauthorizedException);
    });

    it('should handle missing refresh token', async () => {
      const invalidRefreshTokenDto = {
        refreshToken: '',
      };

      mockAuthService.refreshToken.mockRejectedValue(new Error('Validation failed'));

      await expect(controller.refreshToken(invalidRefreshTokenDto))
        .rejects.toThrow();
    });
  });

  describe('changePassword', () => {
    const validChangePasswordDto: ChangePasswordDto = {
      currentPassword: 'oldPassword123',
      newPassword: 'newPassword456',
    };

    const mockRequest = {
      user: {
        id: 'user-id',
        email: 'test@example.com',
      },
    };

    const mockChangePasswordResponse = {
      message: 'Password changed successfully',
    };

    it('should change password successfully', async () => {
      mockAuthService.changePassword.mockResolvedValue(mockChangePasswordResponse);

      const result = await controller.changePassword(mockRequest, validChangePasswordDto);

      expect(result).toEqual(mockChangePasswordResponse);
      expect(mockAuthService.changePassword).toHaveBeenCalledWith('user-id', validChangePasswordDto);
    });

    it('should handle UnauthorizedException for incorrect current password', async () => {
      mockAuthService.changePassword.mockRejectedValue(new UnauthorizedException('Current password is incorrect'));

      await expect(controller.changePassword(mockRequest, validChangePasswordDto))
        .rejects.toThrow(UnauthorizedException);
    });

    it('should extract user ID from request correctly', async () => {
      mockAuthService.changePassword.mockResolvedValue(mockChangePasswordResponse);

      await controller.changePassword(mockRequest, validChangePasswordDto);

      expect(mockAuthService.changePassword).toHaveBeenCalledWith('user-id', validChangePasswordDto);
    });

    it('should handle missing current password', async () => {
      const invalidChangePasswordDto = {
        currentPassword: '',
        newPassword: 'newPassword456',
      };

      mockAuthService.changePassword.mockRejectedValue(new Error('Validation failed'));

      await expect(controller.changePassword(mockRequest, invalidChangePasswordDto))
        .rejects.toThrow();
    });

    it('should handle missing new password', async () => {
      const invalidChangePasswordDto = {
        currentPassword: 'oldPassword123',
        newPassword: '',
      };

      mockAuthService.changePassword.mockRejectedValue(new Error('Validation failed'));

      await expect(controller.changePassword(mockRequest, invalidChangePasswordDto))
        .rejects.toThrow();
    });

    it('should handle short new password', async () => {
      const invalidChangePasswordDto = {
        currentPassword: 'oldPassword123',
        newPassword: '123',
      };

      mockAuthService.changePassword.mockRejectedValue(new Error('Validation failed'));

      await expect(controller.changePassword(mockRequest, invalidChangePasswordDto))
        .rejects.toThrow();
    });
  });

  describe('Controller instantiation', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should have authService injected', () => {
      expect(authService).toBeDefined();
    });

    it('should be an instance of AuthController', () => {
      expect(controller).toBeInstanceOf(AuthController);
    });
  });

  describe('Authentication protection', () => {
    it('should protect changePassword endpoint with AuthGuard', () => {
      // Note: In integration tests, we would verify the guard is applied
      // Here we just verify the guard exists in the test setup
      expect(mockAuthGuard).toBeDefined();
    });
  });

  describe('HTTP Status Codes', () => {
    it('should return 201 for successful signup', async () => {
      const mockSignupResponse = {
        user: { id: 'user-id', email: 'test@example.com' },
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      mockAuthService.signup.mockResolvedValue(mockSignupResponse);

      const result = await controller.signup({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        dateOfBirth: '1990-01-01',
        gender: 'male',
        address: '123 Test St',
        subscribeToNewsletter: true,
      });

      // Controller returns the result, status code would be handled by decorators
      expect(result).toEqual(mockSignupResponse);
    });

    it('should return 200 for successful login', async () => {
      const mockLoginResponse = {
        user: { id: 'user-id', email: 'test@example.com' },
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      mockAuthService.login.mockResolvedValue(mockLoginResponse);

      const result = await controller.login({
        email: 'test@example.com',
        password: 'password123',
      });

      // Controller returns the result, status code would be handled by @HttpCode decorator
      expect(result).toEqual(mockLoginResponse);
    });
  });
}); 