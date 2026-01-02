import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { WellnessService } from './wellness.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Public } from '../auth/public.decorator';

@Controller()
@UseGuards(JwtAuthGuard)
export class WellnessController {
  constructor(private readonly wellnessService: WellnessService) {}

  // Programs
  @Get('admin/wellness/programs')
  async getPrograms(@Query('tenant_code') tenantCode?: string) {
    try {
      return await this.wellnessService.getPrograms(tenantCode);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('admin/wellness/programs/:id')
  async getProgram(@Param('id') id: string) {
    try {
      return await this.wellnessService.getProgram(id);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.NOT_FOUND);
    }
  }

  @Post('admin/wellness/programs')
  async createProgram(@Body() programDto: any) {
    try {
      return await this.wellnessService.createProgram(programDto);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Put('admin/wellness/programs/:id')
  async updateProgram(@Param('id') id: string, @Body() updateDto: any) {
    try {
      return await this.wellnessService.updateProgram(id, updateDto);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete('admin/wellness/programs/:id')
  async deleteProgram(@Param('id') id: string) {
    try {
      return await this.wellnessService.deleteProgram(id);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  // Activities
  @Get('admin/wellness/activities')
  async getActivities(@Query('program_id') programId?: string) {
    try {
      return await this.wellnessService.getActivities(programId);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('admin/wellness/activities')
  async createActivity(@Body() activityDto: any) {
    try {
      return await this.wellnessService.createActivity(activityDto);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  // Challenges
  @Get('admin/wellness/challenges')
  async getChallenges(@Query('tenant_code') tenantCode?: string) {
    try {
      return await this.wellnessService.getChallenges(tenantCode);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('admin/wellness/challenges')
  async createChallenge(@Body() challengeDto: any) {
    try {
      return await this.wellnessService.createChallenge(challengeDto);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  // Leaderboard
  @Get('admin/wellness/leaderboard')
  async getLeaderboard(
    @Query('tenant_code') tenantCode: string,
    @Query('limit') limit?: string,
  ) {
    try {
      return await this.wellnessService.getLeaderboard(tenantCode, limit ? parseInt(limit) : 10);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Employee endpoints (public with auth)
  @Public()
  @Get('wellness/programs')
  async getPublicPrograms(@Query('tenant_code') tenantCode?: string) {
    try {
      return await this.wellnessService.getPrograms(tenantCode);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Public()
  @Get('wellness/employee/:employeeId/summary')
  async getEmployeeSummary(@Param('employeeId') employeeId: string) {
    try {
      return await this.wellnessService.getEmployeeSummary(employeeId);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Public()
  @Post('wellness/participation')
  async logParticipation(@Body() participationDto: any) {
    try {
      return await this.wellnessService.logParticipation(participationDto);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Public()
  @Post('wellness/challenges/:id/join')
  async joinChallenge(@Param('id') id: string, @Body() body: { employeeId: string }) {
    try {
      return await this.wellnessService.joinChallenge(id, body.employeeId);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Public()
  @Put('wellness/challenges/:id/progress')
  async updateChallengeProgress(
    @Param('id') id: string,
    @Body() body: { employeeId: string; progress: number },
  ) {
    try {
      return await this.wellnessService.updateChallengeProgress(id, body.employeeId, body.progress);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.BAD_REQUEST);
    }
  }
}
