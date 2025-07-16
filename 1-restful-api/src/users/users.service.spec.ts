import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

// Mock bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

const mockBcryptHash = jest.mocked(require('bcrypt').hash);
const mockBcryptCompare = jest.mocked(require('bcrypt').compare);

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
    
    // Reset the private users array before each test
    (service as any).users = [];
    
    // Reset mocks
    jest.clearAllMocks();
  });

  describe('create', () => {
    const validCreateUserDto: CreateUserDto = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
      dateOfBirth: '1990-01-01',
      gender: 'male',
      address: '123 Test St',
      subscribeToNewsletter: true,
    };

    it('should create a user successfully', async () => {
      mockBcryptHash.mockResolvedValue('hashedPassword');

      const result = await service.create(validCreateUserDto);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('email', 'test@example.com');
      expect(result).toHaveProperty('name', 'Test User');
      expect(result).toHaveProperty('createdAt');
      expect(result).toHaveProperty('updatedAt');
      expect(result).not.toHaveProperty('password');
      expect(mockBcryptHash).toHaveBeenCalledWith('password123', 10);
    });

    it('should throw ConflictException if user with email already exists', async () => {
      mockBcryptHash.mockResolvedValue('hashedPassword');
      
      // Create first user
      await service.create(validCreateUserDto);

      // Try to create user with same email
      await expect(service.create(validCreateUserDto))
        .rejects.toThrow(ConflictException);
    });

    it('should hash password before storing', async () => {
      mockBcryptHash.mockResolvedValue('hashedPassword123');

      await service.create(validCreateUserDto);

      expect(mockBcryptHash).toHaveBeenCalledWith('password123', 10);
    });

    it('should convert dateOfBirth string to Date object', async () => {
      mockBcryptHash.mockResolvedValue('hashedPassword');

      const result = await service.create(validCreateUserDto);

      expect(result.dateOfBirth).toBeInstanceOf(Date);
      expect(result.dateOfBirth.toISOString()).toBe('1990-01-01T00:00:00.000Z');
    });
  });

  describe('findAll', () => {
    it('should return empty array when no users exist', async () => {
      const result = await service.findAll();
      expect(result).toEqual([]);
    });

    it('should return all users without passwords', async () => {
      mockBcryptHash.mockResolvedValue('hashedPassword');

      const createUserDto1: CreateUserDto = {
        email: 'user1@example.com',
        password: 'password123',
        name: 'User One',
        dateOfBirth: '1990-01-01',
        gender: 'male',
        address: '123 Test St',
        subscribeToNewsletter: true,
      };

      const createUserDto2: CreateUserDto = {
        email: 'user2@example.com',
        password: 'password456',
        name: 'User Two',
        dateOfBirth: '1992-02-02',
        gender: 'female',
        address: '456 Test Ave',
        subscribeToNewsletter: false,
      };

      await service.create(createUserDto1);
      await service.create(createUserDto2);

      const result = await service.findAll();

      expect(result).toHaveLength(2);
      expect(result[0]).not.toHaveProperty('password');
      expect(result[1]).not.toHaveProperty('password');
      expect(result[0].email).toBe('user1@example.com');
      expect(result[1].email).toBe('user2@example.com');
    });
  });

  describe('findOne', () => {
    it('should return user without password when user exists', async () => {
      mockBcryptHash.mockResolvedValue('hashedPassword');

      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        dateOfBirth: '1990-01-01',
        gender: 'male',
        address: '123 Test St',
        subscribeToNewsletter: true,
      };

      const createdUser = await service.create(createUserDto);
      const result = await service.findOne(createdUser.id);

      expect(result).toEqual(createdUser);
      expect(result).not.toHaveProperty('password');
    });

    it('should throw NotFoundException when user does not exist', async () => {
      await expect(service.findOne('non-existent-id'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('findByEmail', () => {
    it('should return user with password when user exists', async () => {
      mockBcryptHash.mockResolvedValue('hashedPassword');

      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        dateOfBirth: '1990-01-01',
        gender: 'male',
        address: '123 Test St',
        subscribeToNewsletter: true,
      };

      await service.create(createUserDto);
      const result = await service.findByEmail('test@example.com');

      expect(result).toHaveProperty('email', 'test@example.com');
      expect(result).toHaveProperty('password', 'hashedPassword');
    });

    it('should return null when user does not exist', async () => {
      const result = await service.findByEmail('non-existent@example.com');
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    let createdUser: any;

    beforeEach(async () => {
      mockBcryptHash.mockResolvedValue('hashedPassword');

      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        dateOfBirth: '1990-01-01',
        gender: 'male',
        address: '123 Test St',
        subscribeToNewsletter: true,
      };

      createdUser = await service.create(createUserDto);
    });

    it('should update user fields successfully', async () => {
      const updateUserDto: UpdateUserDto = {
        dateOfBirth: '1991-02-02',
        gender: 'female',
        address: '456 New St',
        subscribeToNewsletter: false,
      };

      const result = await service.update(createdUser.id, updateUserDto);

      expect(result.dateOfBirth).toEqual(new Date('1991-02-02'));
      expect(result.gender).toBe('female');
      expect(result.address).toBe('456 New St');
      expect(result.subscribeToNewsletter).toBe(false);
      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(result).not.toHaveProperty('password');
    });

    it('should only update provided fields', async () => {
      const updateUserDto: UpdateUserDto = {
        address: '456 New St',
      };

      const result = await service.update(createdUser.id, updateUserDto);

      expect(result.address).toBe('456 New St');
      expect(result.gender).toBe('male'); // Should remain unchanged
      expect(result.subscribeToNewsletter).toBe(true); // Should remain unchanged
    });

    it('should throw NotFoundException when user does not exist', async () => {
      const updateUserDto: UpdateUserDto = {
        address: '456 New St',
      };

      await expect(service.update('non-existent-id', updateUserDto))
        .rejects.toThrow(NotFoundException);
    });

    it('should handle undefined values correctly', async () => {
      const updateUserDto: UpdateUserDto = {
        dateOfBirth: undefined,
        gender: undefined,
        address: '456 New St',
        subscribeToNewsletter: undefined,
      };

      const result = await service.update(createdUser.id, updateUserDto);

      expect(result.address).toBe('456 New St');
      expect(result.gender).toBe('male'); // Should remain unchanged
    });
  });

  describe('remove', () => {
    it('should remove user successfully', async () => {
      mockBcryptHash.mockResolvedValue('hashedPassword');

      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        dateOfBirth: '1990-01-01',
        gender: 'male',
        address: '123 Test St',
        subscribeToNewsletter: true,
      };

      const createdUser = await service.create(createUserDto);
      
      await service.remove(createdUser.id);

      await expect(service.findOne(createdUser.id))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      await expect(service.remove('non-existent-id'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('changePassword', () => {
    let createdUser: any;

    beforeEach(async () => {
      mockBcryptHash.mockResolvedValue('hashedPassword');

      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        dateOfBirth: '1990-01-01',
        gender: 'male',
        address: '123 Test St',
        subscribeToNewsletter: true,
      };

      createdUser = await service.create(createUserDto);
    });

    it('should change password successfully', async () => {
      mockBcryptCompare.mockResolvedValue(true);
      mockBcryptHash.mockResolvedValue('newHashedPassword');

      const changePasswordDto: ChangePasswordDto = {
        currentPassword: 'password123',
        newPassword: 'newPassword456',
      };

      await service.changePassword(createdUser.id, changePasswordDto);

      expect(mockBcryptCompare).toHaveBeenCalledWith('password123', 'hashedPassword');
      expect(mockBcryptHash).toHaveBeenCalledWith('newPassword456', 10);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      const changePasswordDto: ChangePasswordDto = {
        currentPassword: 'password123',
        newPassword: 'newPassword456',
      };

      await expect(service.changePassword('non-existent-id', changePasswordDto))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw UnauthorizedException when current password is incorrect', async () => {
      mockBcryptCompare.mockResolvedValue(false);

      const changePasswordDto: ChangePasswordDto = {
        currentPassword: 'wrongPassword',
        newPassword: 'newPassword456',
      };

      await expect(service.changePassword(createdUser.id, changePasswordDto))
        .rejects.toThrow(UnauthorizedException);
    });
  });

  describe('calculateAge', () => {
    it('should calculate age correctly', () => {
      const birthDate = new Date('1990-01-01');
      const today = new Date();
      const expectedAge = today.getFullYear() - 1990;
      
      const age = service.calculateAge(birthDate);
      
      expect(age).toBeGreaterThanOrEqual(expectedAge - 1);
      expect(age).toBeLessThanOrEqual(expectedAge);
    });

    it('should handle birthday not yet passed this year', () => {
      const today = new Date();
      const futureDate = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
      const birthDate = new Date(today.getFullYear() - 25, futureDate.getMonth(), futureDate.getDate());
      
      const age = service.calculateAge(birthDate);
      
      expect(age).toBe(24); // Should be 24 since birthday hasn't passed
    });

    it('should handle birthday already passed this year', () => {
      const today = new Date();
      const pastDate = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
      const birthDate = new Date(today.getFullYear() - 25, pastDate.getMonth(), pastDate.getDate());
      
      const age = service.calculateAge(birthDate);
      
      expect(age).toBe(25); // Should be 25 since birthday has passed
    });
  });
});
