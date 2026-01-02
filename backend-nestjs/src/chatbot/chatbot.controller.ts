import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Public } from '../auth/public.decorator';

@Controller()
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  // === PUBLIC ROUTES (for employees/users) ===

  @Public()
  @Post('chatbot/start')
  async startConversation(@Body() body: any) {
    try {
      return await this.chatbotService.startConversation(body);
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Public()
  @Post('chatbot/message')
  async sendMessage(@Body() body: any) {
    try {
      if (!body.message || (!body.conversationId && !body.sessionId)) {
        throw new HttpException(
          { success: false, message: 'Message and conversation ID required' },
          HttpStatus.BAD_REQUEST,
        );
      }
      return await this.chatbotService.sendMessage(body);
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Public()
  @Post('chatbot/end')
  async endConversation(@Body() body: { conversationId: string; rating?: number }) {
    try {
      return await this.chatbotService.endConversation(body.conversationId, body.rating);
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Public()
  @Get('chatbot/conversation/:id')
  async getConversation(@Param('id') id: string) {
    try {
      return await this.chatbotService.getConversation(id);
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  // === ADMIN ROUTES ===

  @UseGuards(JwtAuthGuard)
  @Get('admin/chatbot/analytics')
  async getAnalytics(@Query('tenant_code') tenantCode?: string) {
    try {
      return await this.chatbotService.getAnalytics(tenantCode);
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/chatbot/conversations')
  async getAllConversations(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('status') status?: string,
  ) {
    try {
      return await this.chatbotService.getAllConversations({
        limit: limit ? parseInt(limit) : 20,
        offset: offset ? parseInt(offset) : 0,
        status,
      });
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/chatbot/conversation/:id')
  async getConversationAdmin(@Param('id') id: string) {
    try {
      return await this.chatbotService.getConversation(id);
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.NOT_FOUND,
      );
    }
  }
}
