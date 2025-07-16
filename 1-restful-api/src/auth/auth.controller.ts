import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ChangePasswordDto } from '../users/dto/change-password.dto';
import { AuthGuard } from './auth.guard';
import {
  AuthResponseDto,
  PasswordChangeResponseDto,
} from '../common/dto/response.dto';
import {
  ValidationErrorResponseDto,
  UnauthorizedErrorResponseDto,
  NotFoundErrorResponseDto,
  InternalServerErrorResponseDto,
  ConflictErrorResponseDto,
} from '../common/dto/error-response.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'User with this email already exists',
    type: ConflictErrorResponseDto,
  })
  @ApiResponse({
    status: 422,
    description: 'Validation error',
    type: ValidationErrorResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: InternalServerErrorResponseDto,
  })
  async signup(@Body() createUserDto: CreateUserDto) {
    return this.authService.signup(createUserDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({
    status: 200,
    description: 'User successfully logged in',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
    type: UnauthorizedErrorResponseDto,
  })
  @ApiResponse({
    status: 422,
    description: 'Validation error',
    type: ValidationErrorResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: InternalServerErrorResponseDto,
  })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({
    status: 200,
    description: 'Token successfully refreshed',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid refresh token',
    type: UnauthorizedErrorResponseDto,
  })
  @ApiResponse({
    status: 422,
    description: 'Validation error',
    type: ValidationErrorResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: InternalServerErrorResponseDto,
  })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  @Post('change-password')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change user password' })
  @ApiResponse({
    status: 200,
    description: 'Password successfully changed',
    type: PasswordChangeResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized or invalid current password',
    type: UnauthorizedErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    type: NotFoundErrorResponseDto,
  })
  @ApiResponse({
    status: 422,
    description: 'Validation error',
    type: ValidationErrorResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: InternalServerErrorResponseDto,
  })
  async changePassword(
    @Request() req,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    const userId = changePasswordDto.userId; // we can use req.user.id from the middleware, but for now we use the id from the body
    return this.authService.changePassword(userId, changePasswordDto);
  }
}
