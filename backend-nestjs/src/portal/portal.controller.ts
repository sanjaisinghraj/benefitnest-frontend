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
import { PortalService } from './portal.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Public } from '../auth/public.decorator';

@Controller()
@UseGuards(JwtAuthGuard)
export class PortalController {
  constructor(private readonly portalService: PortalService) {}

  // Configuration
  @Get('admin/portal/config')
  async getConfig(@Query('tenant_code') tenantCode: string) {
    try {
      return await this.portalService.getConfig(tenantCode);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put('admin/portal/config')
  async updateConfig(@Query('tenant_code') tenantCode: string, @Body() configDto: any) {
    try {
      return await this.portalService.updateConfig(tenantCode, configDto);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  // Announcements
  @Get('admin/portal/announcements')
  async getAnnouncements(@Query('tenant_code') tenantCode: string) {
    try {
      return await this.portalService.getAnnouncements(tenantCode);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('admin/portal/announcements')
  async createAnnouncement(@Body() announcementDto: any) {
    try {
      return await this.portalService.createAnnouncement(announcementDto);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Put('admin/portal/announcements/:id')
  async updateAnnouncement(@Param('id') id: string, @Body() updateDto: any) {
    try {
      return await this.portalService.updateAnnouncement(id, updateDto);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete('admin/portal/announcements/:id')
  async deleteAnnouncement(@Param('id') id: string) {
    try {
      return await this.portalService.deleteAnnouncement(id);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  // Quick Links
  @Get('admin/portal/quick-links')
  async getQuickLinks(@Query('tenant_code') tenantCode: string) {
    try {
      return await this.portalService.getQuickLinks(tenantCode);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('admin/portal/quick-links')
  async createQuickLink(@Body() linkDto: any) {
    try {
      return await this.portalService.createQuickLink(linkDto);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Put('admin/portal/quick-links/:id')
  async updateQuickLink(@Param('id') id: string, @Body() updateDto: any) {
    try {
      return await this.portalService.updateQuickLink(id, updateDto);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete('admin/portal/quick-links/:id')
  async deleteQuickLink(@Param('id') id: string) {
    try {
      return await this.portalService.deleteQuickLink(id);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  // FAQs
  @Get('admin/portal/faqs')
  async getFaqs(@Query('tenant_code') tenantCode: string) {
    try {
      return await this.portalService.getFaqs(tenantCode);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('admin/portal/faqs')
  async createFaq(@Body() faqDto: any) {
    try {
      return await this.portalService.createFaq(faqDto);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Put('admin/portal/faqs/:id')
  async updateFaq(@Param('id') id: string, @Body() updateDto: any) {
    try {
      return await this.portalService.updateFaq(id, updateDto);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete('admin/portal/faqs/:id')
  async deleteFaq(@Param('id') id: string) {
    try {
      return await this.portalService.deleteFaq(id);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  // Public employee portal endpoints
  @Public()
  @Get('portal/config/:tenantCode')
  async getPublicConfig(@Param('tenantCode') tenantCode: string) {
    try {
      return await this.portalService.getConfig(tenantCode);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Public()
  @Get('portal/announcements/:tenantCode')
  async getPublicAnnouncements(@Param('tenantCode') tenantCode: string) {
    try {
      return await this.portalService.getAnnouncements(tenantCode);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Public()
  @Get('portal/quick-links/:tenantCode')
  async getPublicQuickLinks(@Param('tenantCode') tenantCode: string) {
    try {
      return await this.portalService.getQuickLinks(tenantCode);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Public()
  @Get('portal/faqs/:tenantCode')
  async getPublicFaqs(@Param('tenantCode') tenantCode: string) {
    try {
      return await this.portalService.getFaqs(tenantCode);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
