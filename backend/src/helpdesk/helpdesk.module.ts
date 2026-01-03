import { Module } from '@nestjs/common';
import { HelpdeskService } from './helpdesk.service';
import { HelpdeskController } from './helpdesk.controller';
import { HelpdeskAiService } from './helpdesk-ai.service';
import { HelpdeskSlaService } from './helpdesk-sla.service';
import { DatabaseModule } from '../database/database.module';

/**
 * HelpdeskModule - Comprehensive multi-tenant helpdesk system
 * 
 * Features:
 * - Ticket management with full lifecycle (new → resolved → closed)
 * - SLA tracking with configurable policies per tenant/feature/priority
 * - AI-powered triage, categorization, and sentiment analysis
 * - Multi-channel support (web, email, chat)
 * - Escalation rules and red flag detection
 * - Analytics and reporting
 * 
 * API Endpoints:
 * - POST   /api/helpdesk/tickets           - Create ticket
 * - GET    /api/helpdesk/tickets           - List tickets with filters
 * - GET    /api/helpdesk/tickets/:id       - Get ticket details
 * - PATCH  /api/helpdesk/tickets/:id       - Update ticket
 * - POST   /api/helpdesk/tickets/:id/comments - Add comment
 * - POST   /api/helpdesk/tickets/:id/escalate - Escalate ticket
 * - GET    /api/helpdesk/features          - List features/categories
 * - GET    /api/helpdesk/sla-policies      - List SLA policies
 * - GET    /api/helpdesk/analytics         - Get analytics
 * 
 * Employee Endpoints:
 * - POST   /api/helpdesk/employee/tickets  - Create ticket
 * - GET    /api/helpdesk/employee/tickets  - List own tickets
 * - GET    /api/helpdesk/employee/tickets/:id - Get ticket details
 * - POST   /api/helpdesk/employee/tickets/:id/reply - Reply to ticket
 */
@Module({
  imports: [DatabaseModule],
  controllers: [HelpdeskController],
  providers: [
    HelpdeskAiService,
    HelpdeskSlaService,
    HelpdeskService,
  ],
  exports: [HelpdeskService, HelpdeskAiService, HelpdeskSlaService],
})
export class HelpdeskModule {}
