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
import { CorporatesService } from './corporates.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Public } from '../auth/public.decorator';

@Controller('admin/corporates')
@UseGuards(JwtAuthGuard)
export class CorporatesController {
  constructor(private readonly corporatesService: CorporatesService) {}

  // Test endpoint (public)
  @Public()
  @Get('test')
  async test() {
    return {
      success: true,
      message: 'Corporates API is working!',
      timestamp: new Date().toISOString(),
    };
  }

  // Get all corporates
  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sort_by') sortBy?: string,
    @Query('sort_order') sortOrder?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('industry_type') industryType?: string,
    @Query('corporate_type') corporateType?: string,
    @Query('broker_id') brokerId?: string,
    @Query('contract_expiring_days') contractExpiringDays?: string,
    @Query('tags') tags?: string,
  ) {
    try {
      return await this.corporatesService.findAll({
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 1000,
        sortBy,
        sortOrder,
        search,
        status,
        industryType,
        corporateType,
        brokerId,
        contractExpiringDays: contractExpiringDays ? parseInt(contractExpiringDays) : undefined,
        tags: tags ? tags.split(',') : undefined,
      });
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Get statistics
  @Get('statistics')
  async getStatistics(@Query('broker_id') brokerId?: string) {
    try {
      return await this.corporatesService.getStatistics(brokerId);
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Get single corporate
  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.corporatesService.findOne(id);
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  // Create corporate
  @Post()
  async create(@Body() createDto: any) {
    try {
      return await this.corporatesService.create(createDto);
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Update corporate
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateDto: any) {
    try {
      return await this.corporatesService.update(id, updateDto);
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Delete corporate
  @Delete(':id')
  async delete(@Param('id') id: string) {
    try {
      return await this.corporatesService.delete(id);
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Get contacts
  @Get(':id/contacts')
  async getContacts(@Param('id') id: string) {
    try {
      return await this.corporatesService.getContacts(id);
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Add contact
  @Post(':id/contacts')
  async addContact(@Param('id') id: string, @Body() contactDto: any) {
    try {
      return await this.corporatesService.addContact(id, contactDto);
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Get customizations
  @Get(':id/customizations')
  async getCustomizations(@Param('id') id: string) {
    try {
      return await this.corporatesService.getCustomizations(id);
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Get marketplace settings
  @Get(':id/marketplace-settings')
  async getMarketplaceSettings(@Param('id') id: string) {
    try {
      return await this.corporatesService.getMarketplaceSettings(id);
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Update marketplace settings
  @Put(':id/marketplace-settings')
  async updateMarketplaceSettings(@Param('id') id: string, @Body() settingsDto: any) {
    try {
      return await this.corporatesService.updateMarketplaceSettings(id, settingsDto);
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Get testers
  @Get(':id/testers')
  async getTesters(@Param('id') id: string) {
    try {
      return await this.corporatesService.getTesters(id);
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Add tester
  @Post(':id/testers')
  async addTester(@Param('id') id: string, @Body() testerDto: any) {
    try {
      return await this.corporatesService.addTester(id, testerDto);
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Delete tester
  @Delete(':id/testers/:testerId')
  async deleteTester(@Param('id') id: string, @Param('testerId') testerId: string) {
    try {
      return await this.corporatesService.deleteTester(id, testerId);
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
