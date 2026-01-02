import {
  Controller,
  Get,
  Query,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ClaimsAnalyticsService } from './claims-analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('admin/claims-analytics')
@UseGuards(JwtAuthGuard)
export class ClaimsAnalyticsController {
  constructor(private readonly claimsAnalyticsService: ClaimsAnalyticsService) {}

  @Get('overview')
  async getOverview(
    @Query('tenant_code') tenantCode?: string,
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string,
  ) {
    try {
      return await this.claimsAnalyticsService.getOverview(tenantCode, startDate, endDate);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('by-status')
  async getByStatus(@Query('tenant_code') tenantCode?: string) {
    try {
      return await this.claimsAnalyticsService.getByStatus(tenantCode);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('by-type')
  async getByType(@Query('tenant_code') tenantCode?: string) {
    try {
      return await this.claimsAnalyticsService.getByType(tenantCode);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('trend')
  async getTrend(
    @Query('tenant_code') tenantCode?: string,
    @Query('months') months?: string,
  ) {
    try {
      return await this.claimsAnalyticsService.getTrend(tenantCode, months ? parseInt(months) : 12);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('top-categories')
  async getTopCategories(
    @Query('tenant_code') tenantCode?: string,
    @Query('limit') limit?: string,
  ) {
    try {
      return await this.claimsAnalyticsService.getTopCategories(tenantCode, limit ? parseInt(limit) : 10);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('by-department')
  async getByDepartment(@Query('tenant_code') tenantCode?: string) {
    try {
      return await this.claimsAnalyticsService.getByDepartment(tenantCode);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('aging')
  async getAgingReport(@Query('tenant_code') tenantCode?: string) {
    try {
      return await this.claimsAnalyticsService.getAgingReport(tenantCode);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('settlement-ratio')
  async getSettlementRatio(@Query('tenant_code') tenantCode?: string) {
    try {
      return await this.claimsAnalyticsService.getSettlementRatio(tenantCode);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
