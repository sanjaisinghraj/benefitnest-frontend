import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { EscalationService } from './escalation.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Public } from '../auth/public.decorator';

@Controller()
@UseGuards(JwtAuthGuard)
export class EscalationController {
  constructor(private readonly escalationService: EscalationService) {}

  @Get('admin/escalations')
  async findAll(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('tenant_code') tenantCode?: string,
  ) {
    try {
      return await this.escalationService.findAll({
        limit: limit ? parseInt(limit) : 20,
        offset: offset ? parseInt(offset) : 0,
        status,
        priority,
        tenantCode,
      });
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('admin/escalations/stats')
  async getStats(@Query('tenant_code') tenantCode?: string) {
    try {
      return await this.escalationService.getStats(tenantCode);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('admin/escalations/:id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.escalationService.findOne(id);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.NOT_FOUND);
    }
  }

  @Public()
  @Post('escalations')
  async create(@Body() createDto: any) {
    try {
      return await this.escalationService.create(createDto);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Put('admin/escalations/:id')
  async update(@Param('id') id: string, @Body() updateDto: any) {
    try {
      return await this.escalationService.update(id, updateDto);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Put('admin/escalations/:id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string; resolution?: string },
  ) {
    try {
      return await this.escalationService.updateStatus(id, body.status, body.resolution);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Put('admin/escalations/:id/assign')
  async assign(@Param('id') id: string, @Body() body: { assignedTo: string }) {
    try {
      return await this.escalationService.assign(id, body.assignedTo);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('admin/escalations/:id/comments')
  async getComments(@Param('id') id: string) {
    try {
      return await this.escalationService.getComments(id);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('admin/escalations/:id/comments')
  async addComment(@Param('id') id: string, @Body() commentDto: any) {
    try {
      return await this.escalationService.addComment(id, commentDto);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.BAD_REQUEST);
    }
  }
}
