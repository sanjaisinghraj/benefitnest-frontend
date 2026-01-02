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
import { EventsService } from './events.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Public } from '../auth/public.decorator';

@Controller('admin/events')
@UseGuards(JwtAuthGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  async findAll(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('status') status?: string,
    @Query('category') category?: string,
  ) {
    try {
      return await this.eventsService.findAll({
        limit: limit ? parseInt(limit) : 20,
        offset: offset ? parseInt(offset) : 0,
        status,
        category,
      });
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.eventsService.findOne(id);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.NOT_FOUND);
    }
  }

  @Post()
  async create(@Body() createDto: any) {
    try {
      return await this.eventsService.create(createDto);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateDto: any) {
    try {
      return await this.eventsService.update(id, updateDto);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    try {
      return await this.eventsService.delete(id);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Post(':id/assign-tenants')
  async assignToTenants(@Param('id') id: string, @Body() body: { tenantCodes: string[] }) {
    try {
      return await this.eventsService.assignToTenants(id, body.tenantCodes);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Get(':id/registrations')
  async getRegistrations(@Param('id') id: string) {
    try {
      return await this.eventsService.getRegistrations(id);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Public()
  @Post(':id/register')
  async register(@Param('id') id: string, @Body() registrationDto: any) {
    try {
      return await this.eventsService.register(id, registrationDto);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Post(':id/attendance')
  async markAttendance(
    @Param('id') id: string,
    @Body() body: { employeeId: string; attended: boolean },
  ) {
    try {
      return await this.eventsService.markAttendance(id, body.employeeId, body.attended);
    } catch (error) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.BAD_REQUEST);
    }
  }
}
