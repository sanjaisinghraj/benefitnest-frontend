import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  healthCheck() {
    return {
      status: 'ok',
      message: 'BenefitNest Backend API (NestJS)',
      timestamp: new Date().toISOString(),
    };
  }
}
