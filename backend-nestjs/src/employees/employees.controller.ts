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
import { EmployeesService } from './employees.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Public } from '../auth/public.decorator';

@Controller()
@UseGuards(JwtAuthGuard)
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  // Admin endpoints
  @Get('admin/employees')
  async findAll(
    @Query('tenant_code') tenantCode?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('department') department?: string,
  ) {
    try {
      return await this.employeesService.findAll({
        tenantCode,
        limit: limit ? parseInt(limit) : 50,
        offset: offset ? parseInt(offset) : 0,
        search,
        status,
        department,
      });
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('admin/employees/:id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.employeesService.findOne(id);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.NOT_FOUND);
    }
  }

  @Post('admin/employees')
  async create(@Body() createDto: any) {
    try {
      return await this.employeesService.create(createDto);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Put('admin/employees/:id')
  async update(@Param('id') id: string, @Body() updateDto: any) {
    try {
      return await this.employeesService.update(id, updateDto);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete('admin/employees/:id')
  async delete(@Param('id') id: string) {
    try {
      return await this.employeesService.delete(id);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('admin/employees/bulk-import')
  async bulkImport(@Body() body: { employees: any[]; tenantCode: string }) {
    try {
      return await this.employeesService.bulkImport(body.employees, body.tenantCode);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  // Dependents
  @Get('admin/employees/:id/dependents')
  async getDependents(@Param('id') id: string) {
    try {
      return await this.employeesService.getDependents(id);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('admin/employees/:id/dependents')
  async addDependent(@Param('id') id: string, @Body() dependentDto: any) {
    try {
      return await this.employeesService.addDependent(id, dependentDto);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Put('admin/employees/dependents/:dependentId')
  async updateDependent(@Param('dependentId') dependentId: string, @Body() updateDto: any) {
    try {
      return await this.employeesService.updateDependent(dependentId, updateDto);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete('admin/employees/dependents/:dependentId')
  async deleteDependent(@Param('dependentId') dependentId: string) {
    try {
      return await this.employeesService.deleteDependent(dependentId);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  // Employee portal endpoints (public with employee auth)
  @Public()
  @Post('employee/login')
  async login(@Body() body: { email: string; password: string; tenantCode: string }) {
    try {
      return await this.employeesService.login(body.email, body.password, body.tenantCode);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.UNAUTHORIZED);
    }
  }

  @Public()
  @Get('employee/:tenantCode/:employeeId')
  async getByEmployeeId(
    @Param('tenantCode') tenantCode: string,
    @Param('employeeId') employeeId: string,
  ) {
    try {
      return await this.employeesService.findByEmployeeId(employeeId, tenantCode);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.NOT_FOUND);
    }
  }

  @Public()
  @Put('employee/:id/change-password')
  async changePassword(
    @Param('id') id: string,
    @Body() body: { currentPassword: string; newPassword: string },
  ) {
    try {
      return await this.employeesService.changePassword(id, body.currentPassword, body.newPassword);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Public()
  @Get('employee/:id/dependents')
  async getEmployeeDependents(@Param('id') id: string) {
    try {
      return await this.employeesService.getDependents(id);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Public()
  @Post('employee/:id/dependents')
  async addEmployeeDependent(@Param('id') id: string, @Body() dependentDto: any) {
    try {
      return await this.employeesService.addDependent(id, dependentDto);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Public()
  @Get('employee/:id/enrollments')
  async getEnrollments(@Param('id') id: string) {
    try {
      return await this.employeesService.getEnrollments(id);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Public()
  @Post('employee/:id/enrollments')
  async createEnrollment(@Param('id') id: string, @Body() enrollmentDto: any) {
    try {
      return await this.employeesService.createEnrollment({ ...enrollmentDto, employeeId: id });
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Public()
  @Get('employee/:id/claims')
  async getClaims(@Param('id') id: string) {
    try {
      return await this.employeesService.getClaims(id);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
