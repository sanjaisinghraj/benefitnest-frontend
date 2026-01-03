import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Headers,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HelpdeskService, CreateTicketDto, TicketFilters } from './helpdesk.service';
import { HelpdeskAiService } from './helpdesk-ai.service';
import { HelpdeskSlaService } from './helpdesk-sla.service';

// Simple tenant extraction helper
function extractTenantId(headers: any): string | null {
  return headers['x-tenant-id'] || headers['tenant-id'] || null;
}

function extractActor(headers: any): any {
  return {
    id: headers['x-user-id'] || null,
    email: headers['x-user-email'] || null,
    name: headers['x-user-name'] || 'System',
    role: headers['x-user-role'] || 'admin',
  };
}

@Controller('api/helpdesk')
export class HelpdeskController {
  constructor(
    private readonly helpdeskService: HelpdeskService,
    private readonly aiService: HelpdeskAiService,
    private readonly slaService: HelpdeskSlaService,
  ) {}

  // ============================================
  // TICKETS
  // ============================================

  /**
   * Create a new ticket
   * POST /api/helpdesk/tickets
   */
  @Post('tickets')
  async createTicket(
    @Body() body: CreateTicketDto,
    @Headers() headers: any,
  ) {
    try {
      const tenantId = body.tenantId || extractTenantId(headers);
      if (!tenantId) {
        throw new HttpException('Tenant ID required', HttpStatus.BAD_REQUEST);
      }

      return await this.helpdeskService.createTicket({
        ...body,
        tenantId,
      });
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Failed to create ticket',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get all tickets with filters
   * GET /api/helpdesk/tickets
   */
  @Get('tickets')
  async getTickets(
    @Query() query: TicketFilters,
    @Headers() headers: any,
  ) {
    try {
      const tenantId = query.tenantId || extractTenantId(headers);
      return await this.helpdeskService.findAllTickets({
        ...query,
        tenantId,
      });
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Failed to fetch tickets',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get a single ticket by ID
   * GET /api/helpdesk/tickets/:id
   */
  @Get('tickets/:id')
  async getTicket(
    @Param('id') id: string,
    @Headers() headers: any,
  ) {
    try {
      const tenantId = extractTenantId(headers);
      return await this.helpdeskService.findOneTicket(id, tenantId);
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Ticket not found',
        error.status || HttpStatus.NOT_FOUND,
      );
    }
  }

  /**
   * Update a ticket
   * PATCH /api/helpdesk/tickets/:id
   */
  @Patch('tickets/:id')
  async updateTicket(
    @Param('id') id: string,
    @Body() body: any,
    @Headers() headers: any,
  ) {
    try {
      const actor = extractActor(headers);
      return await this.helpdeskService.updateTicket(id, body, actor);
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Failed to update ticket',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Escalate a ticket
   * POST /api/helpdesk/tickets/:id/escalate
   */
  @Post('tickets/:id/escalate')
  async escalateTicket(
    @Param('id') id: string,
    @Body() body: { note?: string },
    @Headers() headers: any,
  ) {
    try {
      const actor = extractActor(headers);
      return await this.helpdeskService.escalateTicket(id, actor, body.note);
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Failed to escalate ticket',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Reopen a ticket
   * POST /api/helpdesk/tickets/:id/reopen
   */
  @Post('tickets/:id/reopen')
  async reopenTicket(
    @Param('id') id: string,
    @Body() body: { reason: string },
    @Headers() headers: any,
  ) {
    try {
      const actor = extractActor(headers);
      return await this.helpdeskService.reopenTicket(id, actor, body.reason);
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Failed to reopen ticket',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ============================================
  // COMMENTS
  // ============================================

  /**
   * Add a comment to a ticket
   * POST /api/helpdesk/tickets/:id/comments
   */
  @Post('tickets/:id/comments')
  async addComment(
    @Param('id') ticketId: string,
    @Body() body: any,
    @Headers() headers: any,
  ) {
    try {
      const actor = extractActor(headers);
      return await this.helpdeskService.addComment(ticketId, {
        ...body,
        authorId: actor.id,
        authorEmail: actor.email,
        authorName: actor.name,
        authorRole: actor.role,
      });
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Failed to add comment',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get comments for a ticket
   * GET /api/helpdesk/tickets/:id/comments
   */
  @Get('tickets/:id/comments')
  async getComments(
    @Param('id') ticketId: string,
    @Query('includeInternal') includeInternal: string,
  ) {
    try {
      return await this.helpdeskService.getComments(
        ticketId,
        includeInternal === 'true',
      );
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Failed to fetch comments',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ============================================
  // FEATURES
  // ============================================

  /**
   * Get all features/categories
   * GET /api/helpdesk/features
   */
  @Get('features')
  async getFeatures(@Headers() headers: any) {
    try {
      const tenantId = extractTenantId(headers);
      return await this.helpdeskService.getFeatures(tenantId);
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Failed to fetch features',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Create a feature
   * POST /api/helpdesk/features
   */
  @Post('features')
  async createFeature(@Body() body: any) {
    try {
      return await this.helpdeskService.createFeature(body);
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Failed to create feature',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Update a feature
   * PATCH /api/helpdesk/features/:id
   */
  @Patch('features/:id')
  async updateFeature(@Param('id') id: string, @Body() body: any) {
    try {
      return await this.helpdeskService.updateFeature(id, body);
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Failed to update feature',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ============================================
  // SLA POLICIES
  // ============================================

  /**
   * Get SLA policies
   * GET /api/helpdesk/sla-policies
   */
  @Get('sla-policies')
  async getSlaPolicies(
    @Query('tenantId') tenantId: string,
    @Query('featureId') featureId: string,
    @Headers() headers: any,
  ) {
    try {
      const effectiveTenantId = tenantId || extractTenantId(headers);
      return await this.helpdeskService.getSlaPolicies(effectiveTenantId, featureId);
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Failed to fetch SLA policies',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Create SLA policy
   * POST /api/helpdesk/sla-policies
   */
  @Post('sla-policies')
  async createSlaPolicy(@Body() body: any) {
    try {
      return await this.helpdeskService.createSlaPolicy(body);
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Failed to create SLA policy',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get SLA status for a ticket
   * GET /api/helpdesk/tickets/:id/sla-status
   */
  @Get('tickets/:id/sla-status')
  async getSlaStatus(@Param('id') id: string) {
    try {
      const status = await this.slaService.getSlaStatus(id);
      return { success: true, data: status };
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Failed to get SLA status',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ============================================
  // ESCALATION RULES
  // ============================================

  /**
   * Get escalation rules
   * GET /api/helpdesk/escalation-rules
   */
  @Get('escalation-rules')
  async getEscalationRules(@Headers() headers: any) {
    try {
      const tenantId = extractTenantId(headers);
      return await this.helpdeskService.getEscalationRules(tenantId);
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Failed to fetch escalation rules',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Create escalation rule
   * POST /api/helpdesk/escalation-rules
   */
  @Post('escalation-rules')
  async createEscalationRule(@Body() body: any) {
    try {
      return await this.helpdeskService.createEscalationRule(body);
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Failed to create escalation rule',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ============================================
  // QUEUE ASSIGNMENTS
  // ============================================

  /**
   * Get queue assignments
   * GET /api/helpdesk/queue-assignments
   */
  @Get('queue-assignments')
  async getQueueAssignments(
    @Query('tenantId') tenantId: string,
    @Query('featureId') featureId: string,
    @Headers() headers: any,
  ) {
    try {
      const effectiveTenantId = tenantId || extractTenantId(headers);
      if (!effectiveTenantId) {
        throw new HttpException('Tenant ID required', HttpStatus.BAD_REQUEST);
      }
      return await this.helpdeskService.getQueueAssignments(effectiveTenantId, featureId);
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Failed to fetch queue assignments',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Create queue assignment
   * POST /api/helpdesk/queue-assignments
   */
  @Post('queue-assignments')
  async createQueueAssignment(@Body() body: any) {
    try {
      return await this.helpdeskService.createQueueAssignment(body);
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Failed to create queue assignment',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ============================================
  // CANNED RESPONSES
  // ============================================

  /**
   * Get canned responses
   * GET /api/helpdesk/canned-responses
   */
  @Get('canned-responses')
  async getCannedResponses(
    @Query('tenantId') tenantId: string,
    @Query('featureId') featureId: string,
    @Headers() headers: any,
  ) {
    try {
      const effectiveTenantId = tenantId || extractTenantId(headers);
      return await this.helpdeskService.getCannedResponses(effectiveTenantId, featureId);
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Failed to fetch canned responses',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ============================================
  // AI FEATURES
  // ============================================

  /**
   * Get AI insights for a ticket
   * GET /api/helpdesk/tickets/:id/ai-insights
   */
  @Get('tickets/:id/ai-insights')
  async getAiInsights(@Param('id') ticketId: string) {
    try {
      const insights = await this.aiService.getInsights(ticketId);
      return { success: true, data: insights };
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Failed to fetch AI insights',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get AI response suggestions
   * GET /api/helpdesk/tickets/:id/suggestions
   */
  @Get('tickets/:id/suggestions')
  async getSuggestions(
    @Param('id') ticketId: string,
    @Headers() headers: any,
  ) {
    try {
      const tenantId = extractTenantId(headers);
      const suggestions = await this.aiService.suggestResponses(ticketId, tenantId!);
      return { success: true, data: suggestions };
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Failed to fetch suggestions',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Check if ticket should be escalated
   * GET /api/helpdesk/tickets/:id/should-escalate
   */
  @Get('tickets/:id/should-escalate')
  async shouldEscalate(@Param('id') ticketId: string) {
    try {
      const result = await this.aiService.shouldEscalate(ticketId);
      return { success: true, data: result };
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Failed to check escalation',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Check for duplicate tickets
   * POST /api/helpdesk/check-duplicates
   */
  @Post('check-duplicates')
  async checkDuplicates(
    @Body() body: { tenantId: string; employeeId: string; title: string },
  ) {
    try {
      const duplicates = await this.aiService.findDuplicates(
        body.tenantId,
        body.employeeId,
        body.title,
      );
      return { success: true, data: { duplicateTicketIds: duplicates } };
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Failed to check duplicates',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ============================================
  // ANALYTICS
  // ============================================

  /**
   * Get helpdesk analytics for a tenant
   * GET /api/helpdesk/analytics
   */
  @Get('analytics')
  async getAnalytics(
    @Query('tenantId') tenantId: string,
    @Query('dateFrom') dateFrom: string,
    @Query('dateTo') dateTo: string,
    @Headers() headers: any,
  ) {
    try {
      const effectiveTenantId = tenantId || extractTenantId(headers);
      if (!effectiveTenantId) {
        throw new HttpException('Tenant ID required', HttpStatus.BAD_REQUEST);
      }
      return await this.helpdeskService.getAnalytics(effectiveTenantId, dateFrom, dateTo);
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Failed to fetch analytics',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get global analytics (super admin)
   * GET /api/helpdesk/analytics/global
   */
  @Get('analytics/global')
  async getGlobalAnalytics(
    @Query('dateFrom') dateFrom: string,
    @Query('dateTo') dateTo: string,
  ) {
    try {
      return await this.helpdeskService.getGlobalAnalytics(dateFrom, dateTo);
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Failed to fetch global analytics',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get SLA compliance report
   * GET /api/helpdesk/analytics/sla-compliance
   */
  @Get('analytics/sla-compliance')
  async getSlaComplianceReport(
    @Query('tenantId') tenantId: string,
    @Query('dateFrom') dateFrom: string,
    @Query('dateTo') dateTo: string,
    @Headers() headers: any,
  ) {
    try {
      const effectiveTenantId = tenantId || extractTenantId(headers);
      if (!effectiveTenantId) {
        throw new HttpException('Tenant ID required', HttpStatus.BAD_REQUEST);
      }
      const report = await this.slaService.getSlaComplianceReport(
        effectiveTenantId,
        dateFrom,
        dateTo,
      );
      return { success: true, data: report };
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Failed to fetch SLA compliance report',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get tickets approaching SLA breach
   * GET /api/helpdesk/analytics/approaching-breach
   */
  @Get('analytics/approaching-breach')
  async getApproachingBreaches(
    @Query('tenantId') tenantId: string,
    @Query('thresholdMinutes') thresholdMinutes: string,
    @Headers() headers: any,
  ) {
    try {
      const effectiveTenantId = tenantId || extractTenantId(headers);
      if (!effectiveTenantId) {
        throw new HttpException('Tenant ID required', HttpStatus.BAD_REQUEST);
      }
      const tickets = await this.slaService.getApproachingBreaches(
        effectiveTenantId,
        parseInt(thresholdMinutes) || 60,
      );
      return { success: true, data: tickets };
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Failed to fetch approaching breaches',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ============================================
  // EMPLOYEE-FACING ENDPOINTS
  // ============================================

  /**
   * Create ticket from employee portal
   * POST /api/helpdesk/employee/tickets
   */
  @Post('employee/tickets')
  async createEmployeeTicket(
    @Body() body: any,
    @Headers() headers: any,
  ) {
    try {
      // Employee creates ticket - extract from auth headers
      const employeeId = headers['x-employee-id'];
      const employeeEmail = headers['x-employee-email'];
      const employeeName = headers['x-employee-name'];
      const tenantId = extractTenantId(headers);

      if (!tenantId) {
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      }

      return await this.helpdeskService.createTicket({
        ...body,
        tenantId,
        employeeId,
        employeeEmail,
        employeeName,
        channel: 'web',
      });
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Failed to create ticket',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get employee's own tickets
   * GET /api/helpdesk/employee/tickets
   */
  @Get('employee/tickets')
  async getEmployeeTickets(
    @Query('status') status: string,
    @Headers() headers: any,
  ) {
    try {
      const employeeId = headers['x-employee-id'];
      const tenantId = extractTenantId(headers);

      if (!tenantId || !employeeId) {
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      }

      return await this.helpdeskService.findAllTickets({
        tenantId,
        employeeId,
        status,
      });
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Failed to fetch tickets',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get single ticket for employee (only their own)
   * GET /api/helpdesk/employee/tickets/:id
   */
  @Get('employee/tickets/:id')
  async getEmployeeTicket(
    @Param('id') id: string,
    @Headers() headers: any,
  ) {
    try {
      const employeeId = headers['x-employee-id'];
      const tenantId = extractTenantId(headers);

      const result = await this.helpdeskService.findOneTicket(id, tenantId);
      
      // Verify ownership
      if (result.data.employee_id !== employeeId) {
        throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
      }

      // Filter out internal notes for employee view
      if (result.data.comments) {
        result.data.comments = result.data.comments.filter(
          (c: any) => !c.is_internal_note
        );
      }

      return result;
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Ticket not found',
        error.status || HttpStatus.NOT_FOUND,
      );
    }
  }

  /**
   * Employee adds reply to their ticket
   * POST /api/helpdesk/employee/tickets/:id/reply
   */
  @Post('employee/tickets/:id/reply')
  async addEmployeeReply(
    @Param('id') ticketId: string,
    @Body() body: { body: string; attachments?: any[] },
    @Headers() headers: any,
  ) {
    try {
      const employeeId = headers['x-employee-id'];
      const employeeEmail = headers['x-employee-email'];
      const employeeName = headers['x-employee-name'];

      return await this.helpdeskService.addComment(ticketId, {
        body: body.body,
        attachments: body.attachments,
        authorId: employeeId,
        authorEmail: employeeEmail,
        authorName: employeeName,
        authorRole: 'employee',
        isInternalNote: false,
      });
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Failed to add reply',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
