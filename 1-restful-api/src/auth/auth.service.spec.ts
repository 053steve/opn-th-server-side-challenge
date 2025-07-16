import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from '../users/dto/change-password.dto';

// Mock bcrypt
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

const mockBcryptCompare = jest.mocked(require('bcrypt').compare);

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUsersService = {
    create: jest.fn(),
    findByEmail: jest.fn(),
    findOne: jest.fn(),
    changePassword: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
    verify: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('signup', () => {
    const validCreateUserDto: CreateUserDto = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
      dateOfBirth: '1990-01-01',
      gender: 'male',
      address: '123 Test St',
      subscribeToNewsletter: true,
    };

    const mockUser = {
      id: 'user-id',
      email: 'test@example.com',
      name: 'Test User',
      dateOfBirth: new Date('1990-01-01'),
      gender: 'male' as const,
      address: '123 Test St',
      subscribeToNewsletter: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should signup user successfully', async () => {
      mockUsersService.create.mockResolvedValue(mockUser);
      mockJwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');

      const result = await service.signup(validCreateUserDto);

      expect(result).toHaveProperty('user', mockUser);
      expect(result).toHaveProperty('accessToken', 'access-token');
      expect(result).toHaveProperty('refreshToken', 'refresh-token');
      expect(mockUsersService.create).toHaveBeenCalledWith(validCreateUserDto);
      expect(mockJwtService.signAsync).toHaveBeenCalledTimes(2);
    });

    it('should throw ConflictException when user already exists', async () => {
      mockUsersService.create.mockRejectedValue(
        new ConflictException('User already exists'),
      );

      await expect(service.signup(validCreateUserDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw UnauthorizedException for other signup errors', async () => {
      mockUsersService.create.mockRejectedValue(new Error('Database error'));

      await expect(service.signup(validCreateUserDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should generate tokens with correct payload', async () => {
      mockUsersService.create.mockResolvedValue(mockUser);
      mockJwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');

      await service.signup(validCreateUserDto);

      expect(mockJwtService.signAsync).toHaveBeenCalledWith(
        { sub: 'user-id', email: 'test@example.com' },
        { secret: 'access-secret', expiresIn: '15m' },
      );
      expect(mockJwtService.signAsync).toHaveBeenCalledWith(
        { sub: 'user-id', email: 'test@example.com' },
        { secret: 'refresh-secret', expiresIn: '7d' },
      );
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    const mockUserWithPassword = {
      id: 'user-id',
      email: 'test@example.com',
      password: 'hashedPassword',
      name: 'Test User',
      dateOfBirth: new Date('1990-01-01'),
      gender: 'male' as const,
      address: '123 Test St',
      subscribeToNewsletter: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should login user successfully', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUserWithPassword);
      mockBcryptCompare.mockResolvedValue(true);
      mockJwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('user');
      expect(result.user).not.toHaveProperty('password');
      expect(result).toHaveProperty('accessToken', 'access-token');
      expect(result).toHaveProperty('refreshToken', 'refresh-token');
      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(
        'test@example.com',
      );
      expect(mockBcryptCompare).toHaveBeenCalledWith(
        'password123',
        'hashedPassword',
      );
    });

    it('should throw UnauthorizedException when user not found', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUserWithPassword);
      mockBcryptCompare.mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should return user without password', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUserWithPassword);
      mockBcryptCompare.mockResolvedValue(true);
      mockJwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');

      const result = await service.login(loginDto);

      expect(result.user).not.toHaveProperty('password');
      expect(result.user.email).toBe('test@example.com');
    });
  });

  describe('refreshToken', () => {
    const mockUserWithoutPassword = {
      id: 'user-id',
      email: 'test@example.com',
      name: 'Test User',
      dateOfBirth: new Date('1990-01-01'),
      gender: 'male' as const,
      address: '123 Test St',
      subscribeToNewsletter: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should refresh token successfully', async () => {
      const refreshToken = 'valid-refresh-token';
      const payload = { sub: 'user-id', email: 'test@example.com' };

      mockJwtService.verify.mockReturnValue(payload);
      mockUsersService.findOne.mockResolvedValue(mockUserWithoutPassword);
      mockJwtService.signAsync
        .mockResolvedValueOnce('new-access-token')
        .mockResolvedValueOnce('new-refresh-token');

      const result = await service.refreshToken(refreshToken);

      expect(result).toHaveProperty('user', mockUserWithoutPassword);
      expect(result).toHaveProperty('accessToken', 'new-access-token');
      expect(result).toHaveProperty('refreshToken', 'new-refresh-token');
      expect(mockJwtService.verify).toHaveBeenCalledWith(refreshToken, {
        secret: 'refresh-secret',
      });
      expect(mockUsersService.findOne).toHaveBeenCalledWith('user-id');
    });

    it('should throw UnauthorizedException when token is invalid', async () => {
      const invalidToken = 'invalid-token';
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.refreshToken(invalidToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when token is expired', async () => {
      const expiredToken = 'expired-token';
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Token expired');
      });

      await expect(service.refreshToken(expiredToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('changePassword', () => {
    const changePasswordDto: ChangePasswordDto = {
      userId: 'user-id',
      currentPassword: 'oldPassword',
      newPassword: 'newPassword123',
    };

    it('should change password successfully', async () => {
      mockUsersService.changePassword.mockResolvedValue(undefined);

      const result = await service.changePassword('user-id', changePasswordDto);

      expect(result).toEqual({ message: 'Password changed successfully' });
      expect(mockUsersService.changePassword).toHaveBeenCalledWith(
        'user-id',
        changePasswordDto,
      );
    });

    it('should propagate errors from users service', async () => {
      mockUsersService.changePassword.mockRejectedValue(
        new UnauthorizedException('Current password is incorrect'),
      );

      await expect(
        service.changePassword('user-id', changePasswordDto),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should use userId from DTO parameter', async () => {
      const differentUserId = 'different-user-id';
      const changePasswordDtoWithDifferentId: ChangePasswordDto = {
        userId: differentUserId,
        currentPassword: 'oldPassword',
        newPassword: 'newPassword123',
      };

      mockUsersService.changePassword.mockResolvedValue(undefined);

      await service.changePassword(
        differentUserId,
        changePasswordDtoWithDifferentId,
      );

      expect(mockUsersService.changePassword).toHaveBeenCalledWith(
        differentUserId,
        changePasswordDtoWithDifferentId,
      );
    });
  });

  describe('generateTokens (private method testing via public methods)', () => {
    it('should use environment variables for secrets', async () => {
      // Set environment variables
      process.env.JWT_SECRET = 'custom-access-secret';
      process.env.JWT_REFRESH_SECRET = 'custom-refresh-secret';

      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        name: 'Test User',
        dateOfBirth: new Date('1990-01-01'),
        gender: 'male' as const,
        address: '123 Test St',
        subscribeToNewsletter: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUsersService.create.mockResolvedValue(mockUser);
      mockJwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');

      await service.signup({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        dateOfBirth: '1990-01-01',
        gender: 'male',
        address: '123 Test St',
        subscribeToNewsletter: true,
      });

      expect(mockJwtService.signAsync).toHaveBeenCalledWith(
        { sub: 'user-id', email: 'test@example.com' },
        { secret: 'custom-access-secret', expiresIn: '15m' },
      );
      expect(mockJwtService.signAsync).toHaveBeenCalledWith(
        { sub: 'user-id', email: 'test@example.com' },
        { secret: 'custom-refresh-secret', expiresIn: '7d' },
      );

      // Clean up
      delete process.env.JWT_SECRET;
      delete process.env.JWT_REFRESH_SECRET;
    });

    it('should use default secrets when environment variables are not set', async () => {
      // Ensure environment variables are not set
      delete process.env.JWT_SECRET;
      delete process.env.JWT_REFRESH_SECRET;

      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        name: 'Test User',
        dateOfBirth: new Date('1990-01-01'),
        gender: 'male' as const,
        address: '123 Test St',
        subscribeToNewsletter: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUsersService.create.mockResolvedValue(mockUser);
      mockJwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');

      await service.signup({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        dateOfBirth: '1990-01-01',
        gender: 'male',
        address: '123 Test St',
        subscribeToNewsletter: true,
      });

      expect(mockJwtService.signAsync).toHaveBeenCalledWith(
        { sub: 'user-id', email: 'test@example.com' },
        { secret: 'access-secret', expiresIn: '15m' },
      );
      expect(mockJwtService.signAsync).toHaveBeenCalledWith(
        { sub: 'user-id', email: 'test@example.com' },
        { secret: 'refresh-secret', expiresIn: '7d' },
      );
    });
  });
});
