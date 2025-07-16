import { ApiProperty } from '@nestjs/swagger';

// Base User Response (without password)
export class UserResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  email: string;

  @ApiProperty({ example: 'John Doe' })
  name: string;

  @ApiProperty({ example: '1990-01-01T00:00:00.000Z' })
  dateOfBirth: Date;

  @ApiProperty({ enum: ['male', 'female', 'other'], example: 'male' })
  gender: 'male' | 'female' | 'other';

  @ApiProperty({ example: '123 Main St, City, Country' })
  address: string;

  @ApiProperty({ example: true })
  subscribeToNewsletter: boolean;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  updatedAt: Date;
}

// User Profile Response (includes age)
export class UserProfileResponseDto extends UserResponseDto {
  @ApiProperty({ example: 33 })
  age: number;
}

// Auth Response (user + tokens)
export class AuthResponseDto {
  @ApiProperty({ type: UserResponseDto })
  user: UserResponseDto;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  refreshToken: string;
}

// Password Change Response
export class PasswordChangeResponseDto {
  @ApiProperty({ example: 'Password changed successfully' })
  message: string;
}

// Health Check Response
export class HealthResponseDto {
  @ApiProperty({ example: 'RESTful API is running!' })
  message: string;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  timestamp: string;
}

// Users List Response
export class UsersListResponseDto {
  @ApiProperty({ type: [UserResponseDto] })
  users: UserResponseDto[];
} 