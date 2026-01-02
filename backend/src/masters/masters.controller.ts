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
import { MastersService } from './masters.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Public } from '../auth/public.decorator';

@Controller()
@UseGuards(JwtAuthGuard)
export class MastersController {
  constructor(private readonly mastersService: MastersService) {}

  // Get all masters
  @Get('admin/masters')
  async getAllMasters(@Query('tenant_code') tenantCode?: string) {
    try {
      return await this.mastersService.getAllMasters(tenantCode);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Relationships
  @Get('admin/masters/relationships')
  async getRelationships(@Query('tenant_code') tenantCode?: string) {
    try {
      return await this.mastersService.getRelationships(tenantCode);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('admin/masters/relationships')
  async createRelationship(@Body() dto: any) {
    try {
      return await this.mastersService.createRelationship(dto);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Put('admin/masters/relationships/:id')
  async updateRelationship(@Param('id') id: string, @Body() dto: any) {
    try {
      return await this.mastersService.updateRelationship(id, dto);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete('admin/masters/relationships/:id')
  async deleteRelationship(@Param('id') id: string) {
    try {
      return await this.mastersService.deleteRelationship(id);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  // Designations
  @Get('admin/masters/designations')
  async getDesignations(@Query('tenant_code') tenantCode?: string) {
    try {
      return await this.mastersService.getDesignations(tenantCode);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('admin/masters/designations')
  async createDesignation(@Body() dto: any) {
    try {
      return await this.mastersService.createDesignation(dto);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Put('admin/masters/designations/:id')
  async updateDesignation(@Param('id') id: string, @Body() dto: any) {
    try {
      return await this.mastersService.updateDesignation(id, dto);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete('admin/masters/designations/:id')
  async deleteDesignation(@Param('id') id: string) {
    try {
      return await this.mastersService.deleteDesignation(id);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  // Departments
  @Get('admin/masters/departments')
  async getDepartments(@Query('tenant_code') tenantCode?: string) {
    try {
      return await this.mastersService.getDepartments(tenantCode);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('admin/masters/departments')
  async createDepartment(@Body() dto: any) {
    try {
      return await this.mastersService.createDepartment(dto);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Put('admin/masters/departments/:id')
  async updateDepartment(@Param('id') id: string, @Body() dto: any) {
    try {
      return await this.mastersService.updateDepartment(id, dto);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete('admin/masters/departments/:id')
  async deleteDepartment(@Param('id') id: string) {
    try {
      return await this.mastersService.deleteDepartment(id);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  // Locations
  @Get('admin/masters/locations')
  async getLocations(@Query('tenant_code') tenantCode?: string) {
    try {
      return await this.mastersService.getLocations(tenantCode);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('admin/masters/locations')
  async createLocation(@Body() dto: any) {
    try {
      return await this.mastersService.createLocation(dto);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Put('admin/masters/locations/:id')
  async updateLocation(@Param('id') id: string, @Body() dto: any) {
    try {
      return await this.mastersService.updateLocation(id, dto);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete('admin/masters/locations/:id')
  async deleteLocation(@Param('id') id: string) {
    try {
      return await this.mastersService.deleteLocation(id);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  // Sum Insured
  @Get('admin/masters/sum-insured')
  async getSumInsuredOptions(@Query('tenant_code') tenantCode?: string) {
    try {
      return await this.mastersService.getSumInsuredOptions(tenantCode);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('admin/masters/sum-insured')
  async createSumInsuredOption(@Body() dto: any) {
    try {
      return await this.mastersService.createSumInsuredOption(dto);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Put('admin/masters/sum-insured/:id')
  async updateSumInsuredOption(@Param('id') id: string, @Body() dto: any) {
    try {
      return await this.mastersService.updateSumInsuredOption(id, dto);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete('admin/masters/sum-insured/:id')
  async deleteSumInsuredOption(@Param('id') id: string) {
    try {
      return await this.mastersService.deleteSumInsuredOption(id);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  // Claim Types
  @Get('admin/masters/claim-types')
  async getClaimTypes(@Query('tenant_code') tenantCode?: string) {
    try {
      return await this.mastersService.getClaimTypes(tenantCode);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('admin/masters/claim-types')
  async createClaimType(@Body() dto: any) {
    try {
      return await this.mastersService.createClaimType(dto);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Put('admin/masters/claim-types/:id')
  async updateClaimType(@Param('id') id: string, @Body() dto: any) {
    try {
      return await this.mastersService.updateClaimType(id, dto);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete('admin/masters/claim-types/:id')
  async deleteClaimType(@Param('id') id: string) {
    try {
      return await this.mastersService.deleteClaimType(id);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  // Document Types
  @Get('admin/masters/document-types')
  async getDocumentTypes(@Query('tenant_code') tenantCode?: string) {
    try {
      return await this.mastersService.getDocumentTypes(tenantCode);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('admin/masters/document-types')
  async createDocumentType(@Body() dto: any) {
    try {
      return await this.mastersService.createDocumentType(dto);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Put('admin/masters/document-types/:id')
  async updateDocumentType(@Param('id') id: string, @Body() dto: any) {
    try {
      return await this.mastersService.updateDocumentType(id, dto);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete('admin/masters/document-types/:id')
  async deleteDocumentType(@Param('id') id: string) {
    try {
      return await this.mastersService.deleteDocumentType(id);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  // Public endpoint for lookup
  @Public()
  @Get('lookup/masters')
  async getPublicMasters(@Query('tenant_code') tenantCode?: string) {
    try {
      return await this.mastersService.getAllMasters(tenantCode);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
