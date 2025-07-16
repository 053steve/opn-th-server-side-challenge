import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';
import { HealthResponseDto } from './common/dto/response.dto';
import { InternalServerErrorResponseDto } from './common/dto/error-response.dto';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Health check' })
  @ApiResponse({
    status: 200,
    description: 'Application is running',
    type: HealthResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: InternalServerErrorResponseDto,
  })
  getHello(): { message: string; timestamp: string } {
    return {
      message: this.appService.getHello(),
      timestamp: new Date().toISOString(),
    };
  }
}
