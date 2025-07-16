import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsBoolean, IsOptional } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({
    description: 'User date of birth',
    example: '1990-01-01',
    required: false
  })
  @IsOptional()
  @IsDateString({}, { message: 'Please provide a valid date of birth' })
  dateOfBirth?: string;

  @ApiProperty({
    description: 'User gender',
    enum: ['male', 'female', 'other'],
    example: 'male',
    required: false
  })
  @IsOptional()
  @IsEnum(['male', 'female', 'other'], { message: 'Gender must be male, female, or other' })
  gender?: 'male' | 'female' | 'other';

  @ApiProperty({
    description: 'User address',
    example: '123 Main St, City, Country',
    required: false
  })
  @IsOptional()
  address?: string;

  @ApiProperty({
    description: 'Whether user wants to subscribe to newsletter',
    example: true,
    required: false
  })
  @IsOptional()
  @IsBoolean({ message: 'Subscribe to newsletter must be a boolean' })
  subscribeToNewsletter?: boolean;
} 