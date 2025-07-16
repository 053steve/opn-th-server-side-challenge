import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsDateString, IsEnum, IsBoolean, MinLength, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com'
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({
    description: 'User password (minimum 6 characters)',
    example: 'password123',
    minLength: 6
  })
  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;

  @ApiProperty({
    description: 'User full name',
    example: 'John Doe'
  })
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @ApiProperty({
    description: 'User date of birth',
    example: '1990-01-01'
  })
  @IsDateString({}, { message: 'Please provide a valid date of birth' })
  @IsNotEmpty({ message: 'Date of birth is required' })
  dateOfBirth: string;

  @ApiProperty({
    description: 'User gender',
    enum: ['male', 'female', 'other'],
    example: 'male'
  })
  @IsEnum(['male', 'female', 'other'], { message: 'Gender must be male, female, or other' })
  @IsNotEmpty({ message: 'Gender is required' })
  gender: 'male' | 'female' | 'other';

  @ApiProperty({
    description: 'User address',
    example: '123 Main St, City, Country'
  })
  @IsString({ message: 'Address must be a string' })
  @IsNotEmpty({ message: 'Address is required' })
  address: string;

  @ApiProperty({
    description: 'Whether user wants to subscribe to newsletter',
    example: true
  })
  @IsBoolean({ message: 'Subscribe to newsletter must be a boolean' })
  subscribeToNewsletter: boolean;
} 