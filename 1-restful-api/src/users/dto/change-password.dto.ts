import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, IsNotEmpty } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Current password',
    example: 'currentPassword123'
  })
  @IsString({ message: 'Current password must be a string' })
  @IsNotEmpty({ message: 'Current password is required' })
  currentPassword: string;

  @ApiProperty({
    description: 'New password (minimum 6 characters)',
    example: 'newPassword123',
    minLength: 6
  })
  @IsString({ message: 'New password must be a string' })
  @MinLength(6, { message: 'New password must be at least 6 characters long' })
  @IsNotEmpty({ message: 'New password is required' })
  newPassword: string;
} 