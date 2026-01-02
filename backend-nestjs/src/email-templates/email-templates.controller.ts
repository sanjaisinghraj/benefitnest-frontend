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
import { EmailTemplatesService } from './email-templates.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('admin/email-templates')
@UseGuards(JwtAuthGuard)
export class EmailTemplatesController {
  constructor(private readonly emailTemplatesService: EmailTemplatesService) {}

  @Get()
  async findAll(
    @Query('tenant_code') tenantCode?: string,
    @Query('category') category?: string,
    @Query('is_active') isActive?: string,
  ) {
    try {
      return await this.emailTemplatesService.findAll({
        tenantCode,
        category,
        isActive: isActive !== undefined ? isActive === 'true' : undefined,
      });
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('categories')
  async getCategories() {
    try {
      return await this.emailTemplatesService.getCategories();
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.emailTemplatesService.findOne(id);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.NOT_FOUND);
    }
  }

  @Get('code/:code')
  async findByCode(@Param('code') code: string, @Query('tenant_code') tenantCode?: string) {
    try {
      return await this.emailTemplatesService.findByCode(code, tenantCode);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.NOT_FOUND);
    }
  }

  @Post()
  async create(@Body() createDto: any) {
    try {
      return await this.emailTemplatesService.create(createDto);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateDto: any) {
    try {
      return await this.emailTemplatesService.update(id, updateDto);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    try {
      return await this.emailTemplatesService.delete(id);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Post(':id/duplicate')
  async duplicate(
    @Param('id') id: string,
    @Body() body: { name: string; tenantCode?: string },
  ) {
    try {
      return await this.emailTemplatesService.duplicate(id, body.name, body.tenantCode);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Post(':id/preview')
  async preview(@Param('id') id: string, @Body() body: { sampleData: Record<string, any> }) {
    try {
      return await this.emailTemplatesService.preview(id, body.sampleData);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.BAD_REQUEST);
    }
  }
}
