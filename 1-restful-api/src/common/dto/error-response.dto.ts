import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({
    description: 'HTTP status code',
    example: 400,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Error message or array of validation error messages',
    oneOf: [
      { type: 'string', example: 'User not found' },
      { 
        type: 'array', 
        items: { type: 'string' },
        example: ['Email is required', 'Password must be at least 6 characters long']
      }
    ],
  })
  message: string | string[];

  @ApiProperty({
    description: 'Error type',
    example: 'Bad Request',
  })
  error: string;
}

// Specific error response DTOs for cleaner documentation
export class ValidationErrorResponseDto {
  @ApiProperty({ example: 422 })
  statusCode: number;

  @ApiProperty({ 
    type: 'array',
    items: { type: 'string' },
    example: ['Email is required', 'Password must be at least 6 characters long']
  })
  message: string[];

  @ApiProperty({ example: 'Unprocessable Entity' })
  error: string;
}

export class UnauthorizedErrorResponseDto {
  @ApiProperty({ example: 401 })
  statusCode: number;

  @ApiProperty({ example: 'Missing or invalid authorization header' })
  message: string;

  @ApiProperty({ example: 'Unauthorized' })
  error: string;
}

export class NotFoundErrorResponseDto {
  @ApiProperty({ example: 404 })
  statusCode: number;

  @ApiProperty({ example: 'User not found' })
  message: string;

  @ApiProperty({ example: 'Not Found' })
  error: string;
}

export class ConflictErrorResponseDto {
  @ApiProperty({ example: 409 })
  statusCode: number;

  @ApiProperty({ example: 'User with this email already exists' })
  message: string;

  @ApiProperty({ example: 'Conflict' })
  error: string;
}

export class InternalServerErrorResponseDto {
  @ApiProperty({ example: 500 })
  statusCode: number;

  @ApiProperty({ example: 'Internal server error' })
  message: string;

  @ApiProperty({ example: 'Internal Server Error' })
  error: string;
} 