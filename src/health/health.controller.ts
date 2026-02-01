import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({
    status: 200,
    description: 'Service is healthy',
    schema: {
      example: {
        status: 'ok',
        uptime: 123.456,
        timestamp: '2026-02-01T00:00:00.000Z',
      },
    },
  })
  check() {
    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date(),
    };
  }
}
