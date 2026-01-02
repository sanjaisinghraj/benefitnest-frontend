import { Module } from '@nestjs/common';
import { ClaimsAnalyticsController } from './claims-analytics.controller';
import { ClaimsAnalyticsService } from './claims-analytics.service';

@Module({
  controllers: [ClaimsAnalyticsController],
  providers: [ClaimsAnalyticsService],
  exports: [ClaimsAnalyticsService],
})
export class ClaimsAnalyticsModule {}
