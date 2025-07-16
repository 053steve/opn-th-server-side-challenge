import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiSecurity } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '../auth/auth.guard';
import { 
  UserResponseDto, 
  UserProfileResponseDto,
} from '../common/dto/response.dto';

import { 
  ValidationErrorResponseDto,
  UnauthorizedErrorResponseDto,
  NotFoundErrorResponseDto,
  InternalServerErrorResponseDto
} from '../common/dto/error-response.dto';

import { ConflictErrorResponseDto } from '../common/dto/error-response.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiSecurity('JWT-auth')  // Try this instead of @ApiBearerAuth
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ 
    status: 201, 
    description: 'User successfully created',
    type: UserResponseDto
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Missing or invalid authorization header',
    type: UnauthorizedErrorResponseDto
  })
  @ApiResponse({ 
    status: 409, 
    description: 'User with this email already exists',
    type: ConflictErrorResponseDto
  })
  @ApiResponse({ 
    status: 422, 
    description: 'Validation error',
    type: ValidationErrorResponseDto
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Internal server error',
    type: InternalServerErrorResponseDto
  })
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of all users',
    type: [UserResponseDto]
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Missing or invalid authorization header',
    type: UnauthorizedErrorResponseDto
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Internal server error',
    type: InternalServerErrorResponseDto
  })
  async findAll() {
    return this.usersService.findAll();
  }

  @Get('profile')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ 
    status: 200, 
    description: 'Current user profile',
    type: UserProfileResponseDto
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Missing or invalid authorization header',
    type: UnauthorizedErrorResponseDto
  })
  @ApiResponse({ 
    status: 404, 
    description: 'User not found',
    type: NotFoundErrorResponseDto
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Internal server error',
    type: InternalServerErrorResponseDto
  })
  async getProfile(@Request() req) {
    const user = await this.usersService.findOne(req.user.id);
    const age = this.usersService.calculateAge(user.dateOfBirth);
    return { ...user, age };
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'User found',
    type: UserResponseDto
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Missing or invalid authorization header',
    type: UnauthorizedErrorResponseDto
  })
  @ApiResponse({ 
    status: 404, 
    description: 'User not found',
    type: NotFoundErrorResponseDto
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Internal server error',
    type: InternalServerErrorResponseDto
  })
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'User successfully updated',
    type: UserResponseDto
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Missing or invalid authorization header',
    type: UnauthorizedErrorResponseDto
  })
  @ApiResponse({ 
    status: 404, 
    description: 'User not found',
    type: NotFoundErrorResponseDto
  })
  @ApiResponse({ 
    status: 422, 
    description: 'Validation error',
    type: ValidationErrorResponseDto
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Internal server error',
    type: InternalServerErrorResponseDto
  })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 204, description: 'User successfully deleted' })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Missing or invalid authorization header',
    type: UnauthorizedErrorResponseDto
  })
  @ApiResponse({ 
    status: 404, 
    description: 'User not found',
    type: NotFoundErrorResponseDto
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Internal server error',
    type: InternalServerErrorResponseDto
  })
  async remove(@Param('id') id: string) {
    await this.usersService.remove(id);
  }
}
