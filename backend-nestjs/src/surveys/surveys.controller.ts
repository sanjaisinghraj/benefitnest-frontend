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
import { SurveysService } from './surveys.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Public } from '../auth/public.decorator';

@Controller('surveys')
export class SurveysController {
  constructor(private readonly surveysService: SurveysService) {}

  // Get categories (public)
  @Public()
  @Get('categories')
  async getCategories() {
    try {
      return await this.surveysService.getCategories();
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Add category (protected)
  @UseGuards(JwtAuthGuard)
  @Post('categories')
  async addCategory(@Body() body: { name: string; description?: string }) {
    try {
      if (!body.name) {
        throw new HttpException(
          { success: false, message: 'Category name is required' },
          HttpStatus.BAD_REQUEST,
        );
      }
      return await this.surveysService.addCategory(body.name, body.description);
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Get tenants (protected)
  @UseGuards(JwtAuthGuard)
  @Get('tenants')
  async getTenants() {
    try {
      return await this.surveysService.getTenants();
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // AI Generate (protected)
  @UseGuards(JwtAuthGuard)
  @Post('ai-generate')
  async aiGenerate(@Body() body: { prompt: string; surveyType: string }) {
    try {
      return await this.surveysService.aiGenerate(body.prompt, body.surveyType);
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Get all surveys (protected)
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(
    @Query('tenantId') tenantId?: string,
    @Query('search') search?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('type') type?: string,
    @Query('status') status?: string,
  ) {
    try {
      return await this.surveysService.findAll({
        tenantId,
        search,
        limit: limit ? parseInt(limit) : 5,
        offset: offset ? parseInt(offset) : 0,
        type,
        status,
      });
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Get single survey (public for taking surveys)
  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.surveysService.findOne(id);
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  // Create survey (protected)
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createDto: any) {
    try {
      return await this.surveysService.create(createDto);
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Update survey (protected)
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateDto: any) {
    try {
      return await this.surveysService.update(id, updateDto);
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Delete survey (protected)
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    try {
      return await this.surveysService.delete(id);
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Submit response (public)
  @Public()
  @Post(':id/responses')
  async submitResponse(@Param('id') id: string, @Body() responseDto: any) {
    try {
      return await this.surveysService.submitResponse(id, responseDto);
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Get responses (protected)
  @UseGuards(JwtAuthGuard)
  @Get(':id/responses')
  async getResponses(@Param('id') id: string) {
    try {
      return await this.surveysService.getResponses(id);
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
