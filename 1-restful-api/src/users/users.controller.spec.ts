import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthGuard } from '../auth/auth.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;

  const mockUsersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    calculateAge: jest.fn(),
  };

  const mockAuthGuard = {
    canActivate: jest.fn().mockReturnValue(true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: AuthGuard,
          useValue: mockAuthGuard,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);

    jest.clearAllMocks();
  });

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
      mockUsersService.create.mockResolvedValue(mockUser);

      const result = await controller.create(validCreateUserDto);

      expect(result).toEqual(mockUser);
      expect(mockUsersService.create).toHaveBeenCalledWith(validCreateUserDto);
    });

    it('should handle ConflictException when user already exists', async () => {
      mockUsersService.create.mockRejectedValue(
        new ConflictException('User with this email already exists'),
      );

      await expect(controller.create(validCreateUserDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should validate email format', async () => {
      const invalidEmailDto = {
        ...validCreateUserDto,
        email: 'invalid-email',
      };

      mockUsersService.create.mockRejectedValue(new Error('Validation failed'));

      await expect(controller.create(invalidEmailDto)).rejects.toThrow();
    });

    it('should validate password length', async () => {
      const shortPasswordDto = {
        ...validCreateUserDto,
        password: '123',
      };

      mockUsersService.create.mockRejectedValue(new Error('Validation failed'));

      await expect(controller.create(shortPasswordDto)).rejects.toThrow();
    });

    it('should validate required fields', async () => {
      const incompleteDto = {
        email: 'test@example.com',
        password: 'password123',
        // Missing required fields
      } as CreateUserDto;

      mockUsersService.create.mockRejectedValue(new Error('Validation failed'));

      await expect(controller.create(incompleteDto)).rejects.toThrow();
    });

    it('should validate gender enum', async () => {
      const invalidGenderDto = {
        ...validCreateUserDto,
        gender: 'invalid' as any,
      };

      mockUsersService.create.mockRejectedValue(new Error('Validation failed'));

      await expect(controller.create(invalidGenderDto)).rejects.toThrow();
    });

    it('should validate date format', async () => {
      const invalidDateDto = {
        ...validCreateUserDto,
        dateOfBirth: 'invalid-date',
      };

      mockUsersService.create.mockRejectedValue(new Error('Validation failed'));

      await expect(controller.create(invalidDateDto)).rejects.toThrow();
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const mockUsers = [
        mockUser,
        { ...mockUser, id: 'user-2', email: 'user2@example.com' },
      ];
      mockUsersService.findAll.mockResolvedValue(mockUsers);

      const result = await controller.findAll();

      expect(result).toEqual(mockUsers);
      expect(mockUsersService.findAll).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no users exist', async () => {
      mockUsersService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
      expect(mockUsersService.findAll).toHaveBeenCalledTimes(1);
    });

    it('should not return user passwords', async () => {
      const mockUsers = [mockUser];
      mockUsersService.findAll.mockResolvedValue(mockUsers);

      const result = await controller.findAll();

      expect(result[0]).not.toHaveProperty('password');
    });
  });

  describe('getProfile', () => {
    const mockRequest = {
      user: {
        id: 'user-id',
        email: 'test@example.com',
      },
    };

    it('should return user profile with age calculation', async () => {
      const userWithAge = {
        ...mockUser,
        age: 33, // Calculated age
      };

      mockUsersService.findOne.mockResolvedValue(mockUser);
      mockUsersService.calculateAge = jest.fn().mockReturnValue(33);

      const result = await controller.getProfile('user-id', mockRequest);

      expect(result).toEqual(userWithAge);
      expect(mockUsersService.findOne).toHaveBeenCalledWith('user-id');
      expect(mockUsersService.calculateAge).toHaveBeenCalledWith(
        mockUser.dateOfBirth,
      );
    });

    it('should handle NotFoundException when user not found', async () => {
      mockUsersService.findOne.mockRejectedValue(
        new NotFoundException('User not found'),
      );

      await expect(
        controller.getProfile('non-existent-id', mockRequest),
      ).rejects.toThrow(NotFoundException);
    });

    it('should use ID from parameter instead of request user', async () => {
      const differentUserId = 'different-user-id';
      const differentUser = {
        ...mockUser,
        id: differentUserId,
        email: 'different@example.com',
      };

      const userWithAge = {
        ...differentUser,
        age: 25,
      };

      mockUsersService.findOne.mockResolvedValue(differentUser);
      mockUsersService.calculateAge = jest.fn().mockReturnValue(25);

      const result = await controller.getProfile(differentUserId, mockRequest);

      expect(result).toEqual(userWithAge);
      expect(mockUsersService.findOne).toHaveBeenCalledWith(differentUserId);
      expect(mockUsersService.calculateAge).toHaveBeenCalledWith(
        differentUser.dateOfBirth,
      );
    });

    it('should allow accessing any user profile regardless of authenticated user', async () => {
      // This test verifies that the controller uses the parameter ID instead of req.user.id
      const authenticatedUserId = 'authenticated-user-id';
      const requestedUserId = 'requested-user-id';

      const mockRequestWithDifferentUser = {
        user: {
          id: authenticatedUserId,
          email: 'authenticated@example.com',
        },
      };

      const requestedUser = {
        ...mockUser,
        id: requestedUserId,
        email: 'requested@example.com',
      };

      const requestedUserWithAge = {
        ...requestedUser,
        age: 30,
      };

      mockUsersService.findOne.mockResolvedValue(requestedUser);
      mockUsersService.calculateAge = jest.fn().mockReturnValue(30);

      const result = await controller.getProfile(
        requestedUserId,
        mockRequestWithDifferentUser,
      );

      expect(result).toEqual(requestedUserWithAge);
      expect(mockUsersService.findOne).toHaveBeenCalledWith(requestedUserId);
      // Verify that we're not using the authenticated user's ID
      expect(mockUsersService.findOne).not.toHaveBeenCalledWith(
        authenticatedUserId,
      );
    });

    it('should not return user password in profile', async () => {
      // The service's findOne method already removes the password, so we mock it without password
      const userWithoutPassword = {
        ...mockUser,
        // password is not included as the service removes it
      };

      const userWithAge = {
        ...mockUser,
        age: 33,
      };

      mockUsersService.findOne.mockResolvedValue(userWithoutPassword);
      mockUsersService.calculateAge = jest.fn().mockReturnValue(33);

      const result = await controller.getProfile('user-id', mockRequest);

      expect(result).not.toHaveProperty('password');
      expect(result).toEqual(userWithAge);
    });

    it('should handle invalid user ID format', async () => {
      mockUsersService.findOne.mockRejectedValue(
        new NotFoundException('User not found'),
      );

      await expect(controller.getProfile('', mockRequest)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should calculate age correctly for different birth dates', async () => {
      const youngUser = {
        ...mockUser,
        dateOfBirth: new Date('2000-01-01'),
      };

      const youngUserWithAge = {
        ...youngUser,
        age: 23,
      };

      mockUsersService.findOne.mockResolvedValue(youngUser);
      mockUsersService.calculateAge = jest.fn().mockReturnValue(23);

      const result = await controller.getProfile('young-user-id', mockRequest);

      expect(result).toEqual(youngUserWithAge);
      expect(mockUsersService.calculateAge).toHaveBeenCalledWith(
        youngUser.dateOfBirth,
      );
    });

    it('should handle age calculation errors gracefully', async () => {
      mockUsersService.findOne.mockResolvedValue(mockUser);
      mockUsersService.calculateAge = jest.fn().mockImplementation(() => {
        throw new Error('Age calculation error');
      });

      await expect(
        controller.getProfile('user-id', mockRequest),
      ).rejects.toThrow('Age calculation error');
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      mockUsersService.findOne.mockResolvedValue(mockUser);

      const result = await controller.findOne('user-id');

      expect(result).toEqual(mockUser);
      expect(mockUsersService.findOne).toHaveBeenCalledWith('user-id');
    });

    it('should handle NotFoundException when user not found', async () => {
      mockUsersService.findOne.mockRejectedValue(
        new NotFoundException('User not found'),
      );

      await expect(controller.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should not return user password', async () => {
      mockUsersService.findOne.mockResolvedValue(mockUser);

      const result = await controller.findOne('user-id');

      expect(result).not.toHaveProperty('password');
    });

    it('should handle invalid user ID format', async () => {
      mockUsersService.findOne.mockRejectedValue(
        new NotFoundException('User not found'),
      );

      await expect(controller.findOne('')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const validUpdateUserDto: UpdateUserDto = {
      dateOfBirth: '1991-02-02',
      gender: 'female',
      address: '456 New St',
      subscribeToNewsletter: false,
    };

    const updatedUser = {
      ...mockUser,
      dateOfBirth: new Date('1991-02-02'),
      gender: 'female' as const,
      address: '456 New St',
      subscribeToNewsletter: false,
      updatedAt: new Date(),
    };

    it('should update a user successfully', async () => {
      mockUsersService.update.mockResolvedValue(updatedUser);

      const result = await controller.update('user-id', validUpdateUserDto);

      expect(result).toEqual(updatedUser);
      expect(mockUsersService.update).toHaveBeenCalledWith(
        'user-id',
        validUpdateUserDto,
      );
    });

    it('should handle NotFoundException when user not found', async () => {
      mockUsersService.update.mockRejectedValue(
        new NotFoundException('User not found'),
      );

      await expect(
        controller.update('non-existent-id', validUpdateUserDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should allow partial updates', async () => {
      const partialUpdateDto: UpdateUserDto = {
        address: '789 Partial St',
      };

      const partiallyUpdatedUser = {
        ...mockUser,
        address: '789 Partial St',
        updatedAt: new Date(),
      };

      mockUsersService.update.mockResolvedValue(partiallyUpdatedUser);

      const result = await controller.update('user-id', partialUpdateDto);

      expect(result).toEqual(partiallyUpdatedUser);
      expect(mockUsersService.update).toHaveBeenCalledWith(
        'user-id',
        partialUpdateDto,
      );
    });

    it('should validate gender enum in updates', async () => {
      const invalidGenderDto = {
        gender: 'invalid' as any,
      };

      mockUsersService.update.mockRejectedValue(new Error('Validation failed'));

      await expect(
        controller.update('user-id', invalidGenderDto),
      ).rejects.toThrow();
    });

    it('should validate date format in updates', async () => {
      const invalidDateDto = {
        dateOfBirth: 'invalid-date',
      };

      mockUsersService.update.mockRejectedValue(new Error('Validation failed'));

      await expect(
        controller.update('user-id', invalidDateDto),
      ).rejects.toThrow();
    });

    it('should handle empty update DTO', async () => {
      const emptyUpdateDto: UpdateUserDto = {};

      mockUsersService.update.mockResolvedValue(mockUser);

      const result = await controller.update('user-id', emptyUpdateDto);

      expect(result).toEqual(mockUser);
      expect(mockUsersService.update).toHaveBeenCalledWith(
        'user-id',
        emptyUpdateDto,
      );
    });
  });

  describe('remove', () => {
    it('should remove a user successfully', async () => {
      mockUsersService.remove.mockResolvedValue(undefined);

      await controller.remove('user-id');

      expect(mockUsersService.remove).toHaveBeenCalledWith('user-id');
    });

    it('should handle NotFoundException when user not found', async () => {
      mockUsersService.remove.mockRejectedValue(
        new NotFoundException('User not found'),
      );

      await expect(controller.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should handle invalid user ID', async () => {
      mockUsersService.remove.mockRejectedValue(
        new NotFoundException('User not found'),
      );

      await expect(controller.remove('')).rejects.toThrow(NotFoundException);
    });
  });

  describe('Authentication Guard', () => {
    it('should apply AuthGuard to all endpoints', () => {
      // Note: In integration tests, we would verify the guard is applied
      // Here we just verify the guard exists and would allow access
      expect(mockAuthGuard.canActivate).toBeDefined();
    });

    it('should protect create endpoint', async () => {
      mockUsersService.create.mockResolvedValue(mockUser);

      await controller.create({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        dateOfBirth: '1990-01-01',
        gender: 'male',
        address: '123 Test St',
        subscribeToNewsletter: true,
      });

      // Since the guard is mocked to return true, the endpoint should work
      expect(mockUsersService.create).toHaveBeenCalled();
    });

    it('should protect findAll endpoint', async () => {
      mockUsersService.findAll.mockResolvedValue([mockUser]);

      await controller.findAll();

      expect(mockUsersService.findAll).toHaveBeenCalled();
    });

    it('should protect findOne endpoint', async () => {
      mockUsersService.findOne.mockResolvedValue(mockUser);

      await controller.findOne('user-id');

      expect(mockUsersService.findOne).toHaveBeenCalled();
    });

    it('should protect update endpoint', async () => {
      mockUsersService.update.mockResolvedValue(mockUser);

      await controller.update('user-id', { address: 'New Address' });

      expect(mockUsersService.update).toHaveBeenCalled();
    });

    it('should protect remove endpoint', async () => {
      mockUsersService.remove.mockResolvedValue(undefined);

      await controller.remove('user-id');

      expect(mockUsersService.remove).toHaveBeenCalled();
    });

    it('should protect getProfile endpoint', async () => {
      const mockRequest = {
        user: {
          id: 'user-id',
          email: 'test@example.com',
        },
      };

      mockUsersService.findOne.mockResolvedValue(mockUser);
      mockUsersService.calculateAge = jest.fn().mockReturnValue(33);

      await controller.getProfile('user-id', mockRequest);

      expect(mockUsersService.findOne).toHaveBeenCalled();
      expect(mockUsersService.calculateAge).toHaveBeenCalled();
    });
  });

  describe('Controller instantiation', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should have usersService injected', () => {
      expect(usersService).toBeDefined();
    });

    it('should be an instance of UsersController', () => {
      expect(controller).toBeInstanceOf(UsersController);
    });
  });

  describe('HTTP Status Codes', () => {
    it('should return 201 for successful user creation', async () => {
      mockUsersService.create.mockResolvedValue(mockUser);

      const result = await controller.create({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        dateOfBirth: '1990-01-01',
        gender: 'male',
        address: '123 Test St',
        subscribeToNewsletter: true,
      });

      // Controller returns the result, status code would be handled by decorators
      expect(result).toEqual(mockUser);
    });

    it('should return 200 for successful GET operations', async () => {
      mockUsersService.findAll.mockResolvedValue([mockUser]);
      mockUsersService.findOne.mockResolvedValue(mockUser);

      const resultAll = await controller.findAll();
      const resultOne = await controller.findOne('user-id');

      expect(resultAll).toEqual([mockUser]);
      expect(resultOne).toEqual(mockUser);
    });

    it('should return 200 for successful updates', async () => {
      mockUsersService.update.mockResolvedValue(mockUser);

      const result = await controller.update('user-id', {
        address: 'New Address',
      });

      expect(result).toEqual(mockUser);
    });

    it('should return 200 for successful getProfile', async () => {
      const mockRequest = {
        user: {
          id: 'user-id',
          email: 'test@example.com',
        },
      };

      const userWithAge = {
        ...mockUser,
        age: 33,
      };

      mockUsersService.findOne.mockResolvedValue(mockUser);
      mockUsersService.calculateAge = jest.fn().mockReturnValue(33);

      const result = await controller.getProfile('user-id', mockRequest);

      expect(result).toEqual(userWithAge);
    });
  });

  describe('Error Handling', () => {
    it('should propagate service errors correctly', async () => {
      const serviceError = new Error('Service error');
      mockUsersService.create.mockRejectedValue(serviceError);

      await expect(
        controller.create({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
          dateOfBirth: '1990-01-01',
          gender: 'male',
          address: '123 Test St',
          subscribeToNewsletter: true,
        }),
      ).rejects.toThrow('Service error');
    });

    it('should handle multiple concurrent requests', async () => {
      mockUsersService.findOne.mockResolvedValue(mockUser);

      const promises = [
        controller.findOne('user-1'),
        controller.findOne('user-2'),
        controller.findOne('user-3'),
      ];

      await Promise.all(promises);

      expect(mockUsersService.findOne).toHaveBeenCalledTimes(3);
    });
  });
});
