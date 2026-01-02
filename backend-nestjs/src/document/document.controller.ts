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
import { DocumentService } from './document.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Public } from '../auth/public.decorator';

@Controller()
@UseGuards(JwtAuthGuard)
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  // Documents
  @Get('admin/documents')
  async findAll(
    @Query('tenant_code') tenantCode?: string,
    @Query('category') category?: string,
    @Query('employee_id') employeeId?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    try {
      return await this.documentService.findAll({
        tenantCode,
        category,
        employeeId,
        limit: limit ? parseInt(limit) : 50,
        offset: offset ? parseInt(offset) : 0,
      });
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('admin/documents/:id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.documentService.findOne(id);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.NOT_FOUND);
    }
  }

  @Post('admin/documents')
  async create(@Body() createDto: any) {
    try {
      return await this.documentService.create(createDto);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Put('admin/documents/:id')
  async update(@Param('id') id: string, @Body() updateDto: any) {
    try {
      return await this.documentService.update(id, updateDto);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete('admin/documents/:id')
  async delete(@Param('id') id: string) {
    try {
      return await this.documentService.delete(id);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  // Upload URL
  @Post('admin/documents/upload-url')
  async getUploadUrl(@Body() body: { fileName: string; contentType: string; folder?: string }) {
    try {
      return await this.documentService.getUploadUrl(body.fileName, body.contentType, body.folder);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  // Download URL
  @Get('admin/documents/:id/download')
  async getDownloadUrl(@Param('id') id: string) {
    try {
      const doc = await this.documentService.findOne(id);
      if (!doc.data?.file_url) {
        throw new Error('File not found');
      }
      return await this.documentService.getDownloadUrl(doc.data.file_url);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  // Templates
  @Get('admin/document-templates')
  async getTemplates(@Query('tenant_code') tenantCode?: string) {
    try {
      return await this.documentService.getTemplates(tenantCode);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('admin/document-templates')
  async createTemplate(@Body() templateDto: any) {
    try {
      return await this.documentService.createTemplate(templateDto);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Put('admin/document-templates/:id')
  async updateTemplate(@Param('id') id: string, @Body() updateDto: any) {
    try {
      return await this.documentService.updateTemplate(id, updateDto);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete('admin/document-templates/:id')
  async deleteTemplate(@Param('id') id: string) {
    try {
      return await this.documentService.deleteTemplate(id);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  // Employee portal endpoints
  @Public()
  @Get('documents/employee/:employeeId')
  async getEmployeeDocuments(@Param('employeeId') employeeId: string) {
    try {
      return await this.documentService.findAll({ employeeId });
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Public()
  @Post('documents/upload-url')
  async getPublicUploadUrl(@Body() body: { fileName: string; contentType: string; folder?: string }) {
    try {
      return await this.documentService.getUploadUrl(body.fileName, body.contentType, body.folder);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Public()
  @Post('documents')
  async createPublicDocument(@Body() createDto: any) {
    try {
      return await this.documentService.create(createDto);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.BAD_REQUEST);
    }
  }
}
