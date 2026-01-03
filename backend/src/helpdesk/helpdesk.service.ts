import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';
import { HelpdeskAiService } from './helpdesk-ai.service';
import { HelpdeskSlaService } from './helpdesk-sla.service';

export interface CreateTicketDto {
  tenantId: string;
  employeeId?: string;
  employeeEmail?: string;
  employeeName?: string;
  featureId?: string;
  featureKey?: string;
  title: string;
  description?: string;
  category?: string;
  subcategory?: string;
  priority?: 'critical' | 'high' | 'medium' | 'low';
  channel?: string;
  formData?: Record<string, any>;
  attachments?: any[];
}

export interface TicketFilters {
  tenantId?: string;
  status?: string;
  priority?: string;
  featureId?: string;
  assigneeId?: string;
  employeeId?: string;
  search?: string;
  overdue?: boolean;
  redFlag?: boolean;
  tags?: string[];
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

@Injectable()
export class HelpdeskService {
  constructor(
    private supabase: SupabaseService,
    private aiService: HelpdeskAiService,
    private slaService: HelpdeskSlaService,
  ) {}

  // ============================================
  // TICKETS
  // ============================================

  async createTicket(dto: CreateTicketDto) {
    const client = this.supabase.getClient();

    // Get AI triage suggestions
    const aiTriage = await this.aiService.triageTicket({
      title: dto.title,
      description: dto.description,
      category: dto.category,
    });

    // Determine SLA policy and due dates
    const priority = dto.priority || aiTriage.priority || 'medium';
    const slaInfo = await this.slaService.calculateSla(dto.tenantId, dto.featureId, priority);

    // Get auto-assignment based on queue rules
    const assignment = await this.getAutoAssignment(dto.tenantId, dto.featureId, dto.category);

    const ticketData = {
      tenant_id: dto.tenantId,
      employee_id: dto.employeeId,
      employee_email: dto.employeeEmail,
      employee_name: dto.employeeName,
      feature_id: dto.featureId,
      feature_key: dto.featureKey,
      title: dto.title,
      description: dto.description,
      category: dto.category || aiTriage.category,
      subcategory: dto.subcategory || aiTriage.subcategory,
      priority,
      status: 'new',
      channel: dto.channel || 'web',
      form_data: dto.formData || {},
      
      // SLA
      sla_policy_id: slaInfo.policyId,
      due_at: slaInfo.dueAt,
      first_response_due_at: slaInfo.firstResponseDueAt,
      
      // Assignment
      current_assignee_id: assignment?.assigneeId,
      assignee_name: assignment?.assigneeName,
      assigned_team: assignment?.teamName,
      
      // AI insights
      ai_category_suggestion: aiTriage.category,
      ai_priority_suggestion: aiTriage.priority,
      ai_sentiment: aiTriage.sentiment,
      ai_risk_score: aiTriage.riskScore,
    };

    const { data: ticket, error } = await client
      .from('helpdesk_tickets')
      .insert(ticketData)
      .select()
      .single();

    if (error) throw error;

    // Create initial event
    await this.createEvent(ticket.id, 'ticket_created', null, {
      actorId: dto.employeeId,
      actorEmail: dto.employeeEmail,
      actorName: dto.employeeName,
      actorRole: 'employee',
    });

    // Handle attachments
    if (dto.attachments?.length) {
      await this.addAttachments(ticket.id, dto.attachments, dto.employeeId, dto.employeeEmail);
    }

    // Generate AI summary asynchronously
    this.aiService.generateSummary(ticket.id, dto.title, dto.description).catch(console.error);

    return { success: true, data: ticket, message: 'Ticket created successfully' };
  }

  async findAllTickets(filters: TicketFilters) {
    const {
      tenantId,
      status,
      priority,
      featureId,
      assigneeId,
      employeeId,
      search,
      overdue,
      redFlag,
      tags,
      dateFrom,
      dateTo,
      limit = 20,
      offset = 0,
      sortBy = 'created_at',
      sortOrder = 'desc',
    } = filters;

    let query = this.supabase
      .getClient()
      .from('helpdesk_tickets')
      .select(`
        *,
        feature:helpdesk_features(id, key, name, icon)
      `, { count: 'exact' });

    // Required tenant filter for multi-tenancy
    if (tenantId) query = query.eq('tenant_id', tenantId);
    
    // Status filter
    if (status) {
      if (status.includes(',')) {
        query = query.in('status', status.split(','));
      } else {
        query = query.eq('status', status);
      }
    }

    // Other filters
    if (priority) query = query.eq('priority', priority);
    if (featureId) query = query.eq('feature_id', featureId);
    if (assigneeId) query = query.eq('current_assignee_id', assigneeId);
    if (employeeId) query = query.eq('employee_id', employeeId);
    
    // Search
    if (search) {
      query = query.or(`title.ilike.%${search}%,ticket_number.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Overdue filter
    if (overdue) {
      query = query.lt('due_at', new Date().toISOString())
        .not('status', 'in', '(resolved,closed)');
    }

    // Red flag filter
    if (redFlag) {
      query = query.gt('red_flag_score', 50);
    }

    // Tags filter
    if (tags?.length) {
      query = query.overlaps('tags', tags);
    }

    // Date range
    if (dateFrom) query = query.gte('created_at', dateFrom);
    if (dateTo) query = query.lte('created_at', dateTo);

    // Sorting
    const validSortFields = ['created_at', 'updated_at', 'due_at', 'priority', 'status', 'ticket_number'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    query = query.order(sortField, { ascending: sortOrder === 'asc' });

    // Pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    return {
      success: true,
      data: data || [],
      total: count,
      page: Math.floor(offset / limit) + 1,
      limit,
    };
  }

  async findOneTicket(id: string, tenantId?: string) {
    let query = this.supabase
      .getClient()
      .from('helpdesk_tickets')
      .select(`
        *,
        feature:helpdesk_features(id, key, name, icon, form_schema, categories),
        sla_policy:helpdesk_sla_policies(id, name, first_response_minutes, resolution_target_minutes),
        comments:helpdesk_comments(
          id, body, body_html, is_internal_note, is_auto_reply,
          author_id, author_email, author_name, author_role,
          attachments, sentiment, created_at
        ),
        events:helpdesk_events(
          id, event_type, old_value, new_value,
          actor_name, actor_role, created_at
        ),
        attachments:helpdesk_attachments(
          id, filename, url, mime_type, size_bytes, is_image, created_at
        )
      `)
      .eq('id', id);

    if (tenantId) query = query.eq('tenant_id', tenantId);

    const { data, error } = await query.single();
    if (error) throw error;

    // Sort comments and events
    if (data.comments) {
      data.comments.sort((a: any, b: any) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    }
    if (data.events) {
      data.events.sort((a: any, b: any) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }

    return { success: true, data };
  }

  async updateTicket(id: string, updates: any, actor: any) {
    const client = this.supabase.getClient();

    // Get current ticket for comparison
    const { data: currentTicket } = await client
      .from('helpdesk_tickets')
      .select('*')
      .eq('id', id)
      .single();

    if (!currentTicket) {
      throw new Error('Ticket not found');
    }

    const updateData: any = { updated_at: new Date().toISOString() };
    const events: any[] = [];

    // Handle status change
    if (updates.status && updates.status !== currentTicket.status) {
      updateData.status = updates.status;
      events.push({
        type: 'status_change',
        oldValue: { status: currentTicket.status },
        newValue: { status: updates.status },
      });

      // Handle SLA pause/resume
      if (updates.status === 'awaiting_customer' && !currentTicket.sla_paused_at) {
        updateData.sla_paused_at = new Date().toISOString();
      } else if (currentTicket.sla_paused_at && updates.status !== 'awaiting_customer') {
        const pausedMinutes = Math.floor(
          (Date.now() - new Date(currentTicket.sla_paused_at).getTime()) / 60000
        );
        updateData.sla_pause_duration_minutes = (currentTicket.sla_pause_duration_minutes || 0) + pausedMinutes;
        updateData.sla_paused_at = null;
      }

      // Handle resolved/closed timestamps
      if (updates.status === 'resolved') {
        updateData.resolved_at = new Date().toISOString();
      } else if (updates.status === 'closed') {
        updateData.closed_at = new Date().toISOString();
      } else if (updates.status === 'reopened') {
        updateData.reopened_at = new Date().toISOString();
        updateData.resolved_at = null;
        updateData.closed_at = null;
      }
    }

    // Handle priority change
    if (updates.priority && updates.priority !== currentTicket.priority) {
      updateData.priority = updates.priority;
      events.push({
        type: 'priority_change',
        oldValue: { priority: currentTicket.priority },
        newValue: { priority: updates.priority },
      });

      // Recalculate SLA
      const slaInfo = await this.slaService.calculateSla(
        currentTicket.tenant_id,
        currentTicket.feature_id,
        updates.priority
      );
      updateData.due_at = slaInfo.dueAt;
      updateData.sla_policy_id = slaInfo.policyId;
    }

    // Handle assignment change
    if (updates.assigneeId !== undefined && updates.assigneeId !== currentTicket.current_assignee_id) {
      updateData.current_assignee_id = updates.assigneeId;
      updateData.assignee_name = updates.assigneeName;
      updateData.assigned_team = updates.teamName;
      events.push({
        type: 'assignment',
        oldValue: { 
          assigneeId: currentTicket.current_assignee_id,
          assigneeName: currentTicket.assignee_name,
        },
        newValue: { 
          assigneeId: updates.assigneeId,
          assigneeName: updates.assigneeName,
        },
      });
    }

    // Handle tags
    if (updates.tags) {
      updateData.tags = updates.tags;
      events.push({
        type: 'tag_change',
        oldValue: { tags: currentTicket.tags },
        newValue: { tags: updates.tags },
      });
    }

    // Update ticket
    const { data: updatedTicket, error } = await client
      .from('helpdesk_tickets')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Create events
    for (const event of events) {
      await this.createEvent(id, event.type, event.oldValue, {
        actorId: actor.id,
        actorEmail: actor.email,
        actorName: actor.name,
        actorRole: actor.role,
        newValue: event.newValue,
      });
    }

    return { success: true, data: updatedTicket, message: 'Ticket updated' };
  }

  // ============================================
  // COMMENTS
  // ============================================

  async addComment(ticketId: string, comment: any) {
    const client = this.supabase.getClient();

    // Get ticket for validation
    const { data: ticket } = await client
      .from('helpdesk_tickets')
      .select('id, tenant_id, status, first_response_at')
      .eq('id', ticketId)
      .single();

    if (!ticket) throw new Error('Ticket not found');

    // Analyze sentiment
    const sentiment = await this.aiService.analyzeSentiment(comment.body);

    const commentData = {
      ticket_id: ticketId,
      author_id: comment.authorId,
      author_email: comment.authorEmail,
      author_name: comment.authorName,
      author_role: comment.authorRole,
      body: comment.body,
      body_html: comment.bodyHtml,
      is_internal_note: comment.isInternalNote || false,
      is_auto_reply: comment.isAutoReply || false,
      attachments: comment.attachments || [],
      mentions: comment.mentions || [],
      sentiment,
    };

    const { data, error } = await client
      .from('helpdesk_comments')
      .insert(commentData)
      .select()
      .single();

    if (error) throw error;

    // Update first response time if this is first agent reply
    if (!ticket.first_response_at && 
        comment.authorRole !== 'employee' && 
        !comment.isInternalNote) {
      await client
        .from('helpdesk_tickets')
        .update({ 
          first_response_at: new Date().toISOString(),
          first_replied_at: new Date().toISOString(),
        })
        .eq('id', ticketId);
    }

    return { success: true, data, message: 'Comment added' };
  }

  async getComments(ticketId: string, includeInternal: boolean = false) {
    let query = this.supabase
      .getClient()
      .from('helpdesk_comments')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });

    if (!includeInternal) {
      query = query.eq('is_internal_note', false);
    }

    const { data, error } = await query;
    if (error) throw error;

    return { success: true, data: data || [] };
  }

  // ============================================
  // FEATURES
  // ============================================

  async getFeatures(tenantId?: string) {
    let query = this.supabase
      .getClient()
      .from('helpdesk_features')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    // Get both global and tenant-specific features
    if (tenantId) {
      query = query.or(`tenant_id.is.null,tenant_id.eq.${tenantId}`);
    } else {
      query = query.is('tenant_id', null);
    }

    const { data, error } = await query;
    if (error) throw error;

    return { success: true, data: data || [] };
  }

  async createFeature(feature: any) {
    const { data, error } = await this.supabase
      .getClient()
      .from('helpdesk_features')
      .insert({
        tenant_id: feature.tenantId,
        key: feature.key,
        name: feature.name,
        description: feature.description,
        icon: feature.icon || '📋',
        form_schema: feature.formSchema || [],
        categories: feature.categories || [],
        sort_order: feature.sortOrder || 0,
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data, message: 'Feature created' };
  }

  async updateFeature(id: string, updates: any) {
    const { data, error } = await this.supabase
      .getClient()
      .from('helpdesk_features')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data, message: 'Feature updated' };
  }

  // ============================================
  // SLA POLICIES
  // ============================================

  async getSlaPolicies(tenantId?: string, featureId?: string) {
    let query = this.supabase
      .getClient()
      .from('helpdesk_sla_policies')
      .select('*')
      .eq('is_active', true);

    if (tenantId) {
      query = query.or(`tenant_id.is.null,tenant_id.eq.${tenantId}`);
    }
    if (featureId) {
      query = query.or(`feature_id.is.null,feature_id.eq.${featureId}`);
    }

    const { data, error } = await query;
    if (error) throw error;

    return { success: true, data: data || [] };
  }

  async createSlaPolicy(policy: any) {
    const { data, error } = await this.supabase
      .getClient()
      .from('helpdesk_sla_policies')
      .insert({
        tenant_id: policy.tenantId,
        feature_id: policy.featureId,
        name: policy.name,
        priority: policy.priority,
        first_response_minutes: policy.firstResponseMinutes,
        resolution_target_minutes: policy.resolutionTargetMinutes,
        working_hours: policy.workingHours,
        pause_on_statuses: policy.pauseOnStatuses,
        escalation_enabled: policy.escalationEnabled ?? true,
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data, message: 'SLA policy created' };
  }

  // ============================================
  // ESCALATION RULES
  // ============================================

  async getEscalationRules(tenantId?: string) {
    let query = this.supabase
      .getClient()
      .from('helpdesk_escalation_rules')
      .select('*')
      .eq('is_active', true)
      .order('priority', { ascending: false });

    if (tenantId) {
      query = query.or(`tenant_id.is.null,tenant_id.eq.${tenantId}`);
    }

    const { data, error } = await query;
    if (error) throw error;

    return { success: true, data: data || [] };
  }

  async createEscalationRule(rule: any) {
    const { data, error } = await this.supabase
      .getClient()
      .from('helpdesk_escalation_rules')
      .insert({
        tenant_id: rule.tenantId,
        feature_id: rule.featureId,
        name: rule.name,
        description: rule.description,
        priority: rule.priority || 0,
        conditions: rule.conditions,
        actions: rule.actions,
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data, message: 'Escalation rule created' };
  }

  // ============================================
  // QUEUE ASSIGNMENTS
  // ============================================

  async getQueueAssignments(tenantId: string, featureId?: string) {
    let query = this.supabase
      .getClient()
      .from('helpdesk_queue_assignments')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('is_active', true);

    if (featureId) query = query.eq('feature_id', featureId);

    const { data, error } = await query;
    if (error) throw error;

    return { success: true, data: data || [] };
  }

  async createQueueAssignment(assignment: any) {
    const { data, error } = await this.supabase
      .getClient()
      .from('helpdesk_queue_assignments')
      .insert({
        tenant_id: assignment.tenantId,
        feature_id: assignment.featureId,
        category: assignment.category,
        assignee_user_id: assignment.assigneeUserId,
        assignee_email: assignment.assigneeEmail,
        assignee_name: assignment.assigneeName,
        team_name: assignment.teamName,
        use_round_robin: assignment.useRoundRobin || false,
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data, message: 'Queue assignment created' };
  }

  // ============================================
  // CANNED RESPONSES
  // ============================================

  async getCannedResponses(tenantId?: string, featureId?: string) {
    let query = this.supabase
      .getClient()
      .from('helpdesk_canned_responses')
      .select('*')
      .eq('is_active', true);

    if (tenantId) {
      query = query.or(`tenant_id.is.null,tenant_id.eq.${tenantId}`);
    }
    if (featureId) {
      query = query.or(`feature_id.is.null,feature_id.eq.${featureId}`);
    }

    const { data, error } = await query;
    if (error) throw error;

    return { success: true, data: data || [] };
  }

  // ============================================
  // ANALYTICS
  // ============================================

  async getAnalytics(tenantId: string, dateFrom?: string, dateTo?: string) {
    const client = this.supabase.getClient();

    // Build date range
    const fromDate = dateFrom || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const toDate = dateTo || new Date().toISOString();

    // Get ticket stats
    const { data: tickets } = await client
      .from('helpdesk_tickets')
      .select('id, status, priority, sla_breached, created_at, resolved_at, first_response_at, first_response_due_at, due_at, red_flag_score, feature_key, category')
      .eq('tenant_id', tenantId)
      .gte('created_at', fromDate)
      .lte('created_at', toDate);

    const stats = {
      total: tickets?.length || 0,
      byStatus: {} as Record<string, number>,
      byPriority: {} as Record<string, number>,
      byFeature: {} as Record<string, number>,
      slaCompliance: {
        total: 0,
        met: 0,
        breached: 0,
        percentage: 0,
      },
      avgResolutionMinutes: 0,
      avgFirstResponseMinutes: 0,
      redFlagCount: 0,
    };

    let totalResolutionTime = 0;
    let resolvedCount = 0;
    let totalFirstResponse = 0;
    let respondedCount = 0;

    tickets?.forEach((ticket: any) => {
      // By status
      stats.byStatus[ticket.status] = (stats.byStatus[ticket.status] || 0) + 1;
      
      // By priority
      stats.byPriority[ticket.priority] = (stats.byPriority[ticket.priority] || 0) + 1;
      
      // By feature
      if (ticket.feature_key) {
        stats.byFeature[ticket.feature_key] = (stats.byFeature[ticket.feature_key] || 0) + 1;
      }

      // SLA
      if (ticket.status === 'resolved' || ticket.status === 'closed') {
        stats.slaCompliance.total++;
        if (ticket.sla_breached) {
          stats.slaCompliance.breached++;
        } else {
          stats.slaCompliance.met++;
        }
      }

      // Resolution time
      if (ticket.resolved_at) {
        totalResolutionTime += (new Date(ticket.resolved_at).getTime() - new Date(ticket.created_at).getTime()) / 60000;
        resolvedCount++;
      }

      // First response time
      if (ticket.first_response_at) {
        totalFirstResponse += (new Date(ticket.first_response_at).getTime() - new Date(ticket.created_at).getTime()) / 60000;
        respondedCount++;
      }

      // Red flags
      if (ticket.red_flag_score > 50) {
        stats.redFlagCount++;
      }
    });

    stats.slaCompliance.percentage = stats.slaCompliance.total 
      ? Math.round((stats.slaCompliance.met / stats.slaCompliance.total) * 100)
      : 100;
    stats.avgResolutionMinutes = resolvedCount ? Math.round(totalResolutionTime / resolvedCount) : 0;
    stats.avgFirstResponseMinutes = respondedCount ? Math.round(totalFirstResponse / respondedCount) : 0;

    return { success: true, data: stats };
  }

  async getGlobalAnalytics(dateFrom?: string, dateTo?: string) {
    const fromDate = dateFrom || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const toDate = dateTo || new Date().toISOString();

    const { data: tickets } = await this.supabase
      .getClient()
      .from('helpdesk_tickets')
      .select('id, tenant_id, status, priority, sla_breached, created_at')
      .gte('created_at', fromDate)
      .lte('created_at', toDate);

    const byTenant: Record<string, any> = {};

    tickets?.forEach((ticket: any) => {
      if (!byTenant[ticket.tenant_id]) {
        byTenant[ticket.tenant_id] = { total: 0, open: 0, breached: 0 };
      }
      byTenant[ticket.tenant_id].total++;
      if (!['resolved', 'closed'].includes(ticket.status)) {
        byTenant[ticket.tenant_id].open++;
      }
      if (ticket.sla_breached) {
        byTenant[ticket.tenant_id].breached++;
      }
    });

    return {
      success: true,
      data: {
        totalTickets: tickets?.length || 0,
        byTenant,
      },
    };
  }

  // ============================================
  // HELPERS
  // ============================================

  private async createEvent(ticketId: string, eventType: string, oldValue: any, options: any) {
    await this.supabase
      .getClient()
      .from('helpdesk_events')
      .insert({
        ticket_id: ticketId,
        event_type: eventType,
        old_value: oldValue,
        new_value: options.newValue,
        actor_id: options.actorId,
        actor_email: options.actorEmail,
        actor_name: options.actorName,
        actor_role: options.actorRole,
        metadata: options.metadata || {},
      });
  }

  private async getAutoAssignment(tenantId: string, featureId?: string, category?: string) {
    const { data } = await this.supabase
      .getClient()
      .from('helpdesk_queue_assignments')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .or(`feature_id.is.null${featureId ? `,feature_id.eq.${featureId}` : ''}`)
      .or(`category.is.null${category ? `,category.eq.${category}` : ''}`)
      .limit(1)
      .single();

    if (data) {
      return {
        assigneeId: data.assignee_user_id,
        assigneeName: data.assignee_name,
        teamName: data.team_name,
      };
    }
    return null;
  }

  private async addAttachments(ticketId: string, attachments: any[], uploaderId?: string, uploaderEmail?: string) {
    const attachmentRecords = attachments.map((att) => ({
      ticket_id: ticketId,
      uploader_id: uploaderId,
      uploader_email: uploaderEmail,
      filename: att.filename,
      original_filename: att.originalFilename || att.filename,
      url: att.url,
      storage_path: att.storagePath,
      mime_type: att.mimeType,
      size_bytes: att.size,
      is_image: att.mimeType?.startsWith('image/'),
    }));

    await this.supabase
      .getClient()
      .from('helpdesk_attachments')
      .insert(attachmentRecords);

    // Update attachment count
    await this.supabase
      .getClient()
      .from('helpdesk_tickets')
      .update({ attachments_count: attachments.length })
      .eq('id', ticketId);
  }

  async escalateTicket(ticketId: string, actor: any, note?: string) {
    const client = this.supabase.getClient();

    // Update status
    await client
      .from('helpdesk_tickets')
      .update({
        status: 'escalated',
        red_flag_score: 80,
        updated_at: new Date().toISOString(),
      })
      .eq('id', ticketId);

    // Add escalation event
    await this.createEvent(ticketId, 'escalation', null, {
      actorId: actor.id,
      actorEmail: actor.email,
      actorName: actor.name,
      actorRole: actor.role,
      newValue: { status: 'escalated' },
      metadata: { note },
    });

    // Add internal note if provided
    if (note) {
      await this.addComment(ticketId, {
        authorId: actor.id,
        authorEmail: actor.email,
        authorName: actor.name,
        authorRole: actor.role,
        body: `**Escalation Note:** ${note}`,
        isInternalNote: true,
      });
    }

    return { success: true, message: 'Ticket escalated' };
  }

  async reopenTicket(ticketId: string, actor: any, reason: string) {
    const client = this.supabase.getClient();

    // Check reopen policy (simplified - could be tenant-configurable)
    const { data: ticket } = await client
      .from('helpdesk_tickets')
      .select('closed_at, status')
      .eq('id', ticketId)
      .single();

    if (!ticket || !['resolved', 'closed'].includes(ticket.status)) {
      throw new Error('Ticket cannot be reopened');
    }

    // Check if within reopen window (7 days)
    if (ticket.closed_at) {
      const closedDate = new Date(ticket.closed_at);
      const daysSinceClosed = (Date.now() - closedDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceClosed > 7) {
        throw new Error('Ticket can only be reopened within 7 days of closure');
      }
    }

    await client
      .from('helpdesk_tickets')
      .update({
        status: 'reopened',
        reopened_at: new Date().toISOString(),
        resolved_at: null,
        closed_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', ticketId);

    await this.createEvent(ticketId, 'reopen', { status: ticket.status }, {
      actorId: actor.id,
      actorEmail: actor.email,
      actorName: actor.name,
      actorRole: actor.role,
      newValue: { status: 'reopened' },
      metadata: { reason },
    });

    // Add comment
    await this.addComment(ticketId, {
      authorId: actor.id,
      authorEmail: actor.email,
      authorName: actor.name,
      authorRole: actor.role,
      body: `**Ticket Reopened:** ${reason}`,
      isInternalNote: false,
    });

    return { success: true, message: 'Ticket reopened' };
  }
}
