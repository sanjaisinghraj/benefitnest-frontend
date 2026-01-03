import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';

export interface SlaCalculation {
  policyId: string | null;
  policyName: string;
  firstResponseDueAt: string;
  dueAt: string;
  firstResponseMinutes: number;
  resolutionMinutes: number;
}

export interface SlaStatus {
  firstResponse: {
    target: string;
    actual: string | null;
    isBreached: boolean;
    remainingMinutes: number | null;
  };
  resolution: {
    target: string;
    actual: string | null;
    isBreached: boolean;
    remainingMinutes: number | null;
  };
  pausedMinutes: number;
  effectiveRemainingMinutes: number;
}

@Injectable()
export class HelpdeskSlaService {
  // Default SLA values if no policy found
  private readonly DEFAULT_SLAS = {
    critical: { firstResponse: 15, resolution: 120 },     // 15 min / 2 hours
    high: { firstResponse: 60, resolution: 480 },         // 1 hour / 8 hours
    medium: { firstResponse: 240, resolution: 1440 },     // 4 hours / 24 hours
    low: { firstResponse: 480, resolution: 2880 },        // 8 hours / 48 hours
  };

  constructor(private supabase: SupabaseService) {}

  /**
   * Calculate SLA due dates for a new ticket
   */
  async calculateSla(
    tenantId: string,
    featureId: string | undefined,
    priority: string,
  ): Promise<SlaCalculation> {
    // Find applicable SLA policy
    const policy = await this.findApplicablePolicy(tenantId, featureId, priority);

    const now = new Date();
    let firstResponseMinutes: number;
    let resolutionMinutes: number;

    if (policy) {
      firstResponseMinutes = policy.first_response_minutes;
      resolutionMinutes = policy.resolution_target_minutes;
    } else {
      const defaults = this.DEFAULT_SLAS[priority] || this.DEFAULT_SLAS.medium;
      firstResponseMinutes = defaults.firstResponse;
      resolutionMinutes = defaults.resolution;
    }

    // Calculate due dates considering business hours if configured
    const firstResponseDueAt = this.addBusinessMinutes(now, firstResponseMinutes, policy?.working_hours);
    const dueAt = this.addBusinessMinutes(now, resolutionMinutes, policy?.working_hours);

    return {
      policyId: policy?.id || null,
      policyName: policy?.name || `Default ${priority}`,
      firstResponseDueAt: firstResponseDueAt.toISOString(),
      dueAt: dueAt.toISOString(),
      firstResponseMinutes,
      resolutionMinutes,
    };
  }

  /**
   * Find the most specific applicable SLA policy
   */
  private async findApplicablePolicy(
    tenantId: string,
    featureId: string | undefined,
    priority: string,
  ): Promise<any> {
    const client = this.supabase.getClient();

    // Try to find most specific policy first
    // Priority: tenant + feature + priority > tenant + priority > feature + priority > global priority
    
    let query = client
      .from('helpdesk_sla_policies')
      .select('*')
      .eq('is_active', true)
      .eq('priority', priority);

    const { data: policies } = await query;

    if (!policies?.length) return null;

    // Score policies by specificity
    const scored = policies.map(p => {
      let score = 0;
      if (p.tenant_id === tenantId) score += 10;
      if (p.feature_id && p.feature_id === featureId) score += 5;
      if (!p.tenant_id && !p.feature_id) score += 1; // Global fallback
      return { ...p, score };
    });

    // Filter to applicable policies (tenant match or global)
    const applicable = scored.filter(p => 
      !p.tenant_id || p.tenant_id === tenantId
    );

    if (!applicable.length) return null;

    // Return highest scoring
    applicable.sort((a, b) => b.score - a.score);
    return applicable[0];
  }

  /**
   * Add business minutes to a date, considering working hours
   */
  private addBusinessMinutes(
    startDate: Date,
    minutes: number,
    workingHours?: { start: string; end: string; days: number[] },
  ): Date {
    // If no working hours configured, just add raw minutes
    if (!workingHours) {
      return new Date(startDate.getTime() + minutes * 60000);
    }

    // Parse working hours
    const [startHour, startMin] = workingHours.start.split(':').map(Number);
    const [endHour, endMin] = workingHours.end.split(':').map(Number);
    const workDays = workingHours.days || [1, 2, 3, 4, 5]; // Mon-Fri default

    const workStartMinutes = startHour * 60 + startMin;
    const workEndMinutes = endHour * 60 + endMin;
    const workMinutesPerDay = workEndMinutes - workStartMinutes;

    let result = new Date(startDate);
    let remainingMinutes = minutes;

    while (remainingMinutes > 0) {
      const dayOfWeek = result.getDay();
      const currentMinutes = result.getHours() * 60 + result.getMinutes();

      // Check if it's a work day
      if (!workDays.includes(dayOfWeek)) {
        // Skip to next day
        result.setDate(result.getDate() + 1);
        result.setHours(startHour, startMin, 0, 0);
        continue;
      }

      // If before work hours, move to work start
      if (currentMinutes < workStartMinutes) {
        result.setHours(startHour, startMin, 0, 0);
        continue;
      }

      // If after work hours, move to next work day
      if (currentMinutes >= workEndMinutes) {
        result.setDate(result.getDate() + 1);
        result.setHours(startHour, startMin, 0, 0);
        continue;
      }

      // Calculate remaining work minutes today
      const remainingToday = workEndMinutes - currentMinutes;

      if (remainingMinutes <= remainingToday) {
        // Can complete within today
        result = new Date(result.getTime() + remainingMinutes * 60000);
        remainingMinutes = 0;
      } else {
        // Use up today and continue tomorrow
        remainingMinutes -= remainingToday;
        result.setDate(result.getDate() + 1);
        result.setHours(startHour, startMin, 0, 0);
      }
    }

    return result;
  }

  /**
   * Get current SLA status for a ticket
   */
  async getSlaStatus(ticketId: string): Promise<SlaStatus | null> {
    const { data: ticket } = await this.supabase
      .getClient()
      .from('helpdesk_tickets')
      .select(`
        created_at,
        first_response_at,
        first_response_due_at,
        resolved_at,
        due_at,
        sla_paused_at,
        sla_pause_duration_minutes,
        sla_breached,
        status
      `)
      .eq('id', ticketId)
      .single();

    if (!ticket) return null;

    const now = new Date();
    const createdAt = new Date(ticket.created_at);

    // Calculate pause time
    let pausedMinutes = ticket.sla_pause_duration_minutes || 0;
    if (ticket.sla_paused_at) {
      pausedMinutes += Math.floor((now.getTime() - new Date(ticket.sla_paused_at).getTime()) / 60000);
    }

    // First response SLA
    const firstResponseDue = ticket.first_response_due_at ? new Date(ticket.first_response_due_at) : null;
    const firstResponseActual = ticket.first_response_at ? new Date(ticket.first_response_at) : null;
    const firstResponseBreached = firstResponseDue && (
      firstResponseActual 
        ? firstResponseActual > firstResponseDue
        : now > firstResponseDue && !ticket.sla_paused_at
    );

    // Resolution SLA
    const resolutionDue = ticket.due_at ? new Date(ticket.due_at) : null;
    const resolutionActual = ticket.resolved_at ? new Date(ticket.resolved_at) : null;
    const resolutionBreached = resolutionDue && (
      resolutionActual
        ? resolutionActual > resolutionDue
        : now > resolutionDue && !['resolved', 'closed'].includes(ticket.status)
    );

    // Calculate remaining time
    const firstResponseRemaining = firstResponseDue && !firstResponseActual
      ? Math.floor((firstResponseDue.getTime() - now.getTime() + pausedMinutes * 60000) / 60000)
      : null;

    const resolutionRemaining = resolutionDue && !resolutionActual
      ? Math.floor((resolutionDue.getTime() - now.getTime() + pausedMinutes * 60000) / 60000)
      : null;

    return {
      firstResponse: {
        target: ticket.first_response_due_at,
        actual: ticket.first_response_at,
        isBreached: !!firstResponseBreached,
        remainingMinutes: firstResponseRemaining,
      },
      resolution: {
        target: ticket.due_at,
        actual: ticket.resolved_at,
        isBreached: !!resolutionBreached,
        remainingMinutes: resolutionRemaining,
      },
      pausedMinutes,
      effectiveRemainingMinutes: resolutionRemaining !== null 
        ? resolutionRemaining + pausedMinutes 
        : 0,
    };
  }

  /**
   * Check and update SLA breach status for tickets
   */
  async checkSlaBreaches(tenantId?: string): Promise<number> {
    const client = this.supabase.getClient();
    const now = new Date().toISOString();

    // Find tickets that have breached SLA
    let query = client
      .from('helpdesk_tickets')
      .update({ 
        sla_breached: true,
        red_flag_score: 70, // Increase red flag score on breach
      })
      .lt('due_at', now)
      .is('sla_breached', false)
      .is('sla_paused_at', null)
      .not('status', 'in', '(resolved,closed)');

    if (tenantId) {
      query = query.eq('tenant_id', tenantId);
    }

    const { data, error } = await query.select('id');
    if (error) throw error;

    return data?.length || 0;
  }

  /**
   * Get SLA compliance report for a tenant
   */
  async getSlaComplianceReport(
    tenantId: string,
    dateFrom: string,
    dateTo: string,
  ): Promise<{
    total: number;
    metSla: number;
    breachedSla: number;
    compliancePercentage: number;
    byPriority: Record<string, { met: number; breached: number }>;
    avgResponseMinutes: number;
    avgResolutionMinutes: number;
  }> {
    const { data: tickets } = await this.supabase
      .getClient()
      .from('helpdesk_tickets')
      .select('id, priority, sla_breached, first_response_at, first_response_due_at, resolved_at, due_at, created_at, status')
      .eq('tenant_id', tenantId)
      .gte('created_at', dateFrom)
      .lte('created_at', dateTo)
      .in('status', ['resolved', 'closed']);

    const report = {
      total: tickets?.length || 0,
      metSla: 0,
      breachedSla: 0,
      compliancePercentage: 0,
      byPriority: {} as Record<string, { met: number; breached: number }>,
      avgResponseMinutes: 0,
      avgResolutionMinutes: 0,
    };

    if (!tickets?.length) {
      report.compliancePercentage = 100;
      return report;
    }

    let totalResponseMinutes = 0;
    let totalResolutionMinutes = 0;
    let responseCount = 0;
    let resolutionCount = 0;

    for (const ticket of tickets) {
      // Initialize priority bucket
      if (!report.byPriority[ticket.priority]) {
        report.byPriority[ticket.priority] = { met: 0, breached: 0 };
      }

      // Count breaches
      if (ticket.sla_breached) {
        report.breachedSla++;
        report.byPriority[ticket.priority].breached++;
      } else {
        report.metSla++;
        report.byPriority[ticket.priority].met++;
      }

      // Calculate response time
      if (ticket.first_response_at) {
        const responseTime = (new Date(ticket.first_response_at).getTime() - new Date(ticket.created_at).getTime()) / 60000;
        totalResponseMinutes += responseTime;
        responseCount++;
      }

      // Calculate resolution time
      if (ticket.resolved_at) {
        const resolutionTime = (new Date(ticket.resolved_at).getTime() - new Date(ticket.created_at).getTime()) / 60000;
        totalResolutionMinutes += resolutionTime;
        resolutionCount++;
      }
    }

    report.compliancePercentage = Math.round((report.metSla / report.total) * 100);
    report.avgResponseMinutes = responseCount ? Math.round(totalResponseMinutes / responseCount) : 0;
    report.avgResolutionMinutes = resolutionCount ? Math.round(totalResolutionMinutes / resolutionCount) : 0;

    return report;
  }

  /**
   * Recalculate SLA due dates after priority change
   */
  async recalculateSla(ticketId: string, newPriority: string): Promise<SlaCalculation> {
    const { data: ticket } = await this.supabase
      .getClient()
      .from('helpdesk_tickets')
      .select('tenant_id, feature_id, created_at, sla_pause_duration_minutes')
      .eq('id', ticketId)
      .single();

    if (!ticket) throw new Error('Ticket not found');

    // Calculate new SLA from original creation time
    const newSla = await this.calculateSla(ticket.tenant_id, ticket.feature_id, newPriority);

    // Adjust for any pause time
    if (ticket.sla_pause_duration_minutes) {
      const pauseMs = ticket.sla_pause_duration_minutes * 60000;
      newSla.dueAt = new Date(new Date(newSla.dueAt).getTime() + pauseMs).toISOString();
      newSla.firstResponseDueAt = new Date(new Date(newSla.firstResponseDueAt).getTime() + pauseMs).toISOString();
    }

    // Update ticket
    await this.supabase
      .getClient()
      .from('helpdesk_tickets')
      .update({
        sla_policy_id: newSla.policyId,
        due_at: newSla.dueAt,
        first_response_due_at: newSla.firstResponseDueAt,
      })
      .eq('id', ticketId);

    return newSla;
  }

  /**
   * Get tickets approaching SLA breach (for warnings)
   */
  async getApproachingBreaches(
    tenantId: string,
    warningThresholdMinutes: number = 60,
  ): Promise<any[]> {
    const now = new Date();
    const warningTime = new Date(now.getTime() + warningThresholdMinutes * 60000);

    const { data } = await this.supabase
      .getClient()
      .from('helpdesk_tickets')
      .select('id, ticket_number, title, priority, due_at, current_assignee_id, assignee_name')
      .eq('tenant_id', tenantId)
      .is('sla_breached', false)
      .is('sla_paused_at', null)
      .not('status', 'in', '(resolved,closed)')
      .gt('due_at', now.toISOString())
      .lt('due_at', warningTime.toISOString())
      .order('due_at', { ascending: true });

    return data || [];
  }

  /**
   * Pause SLA timer for a ticket
   */
  async pauseSla(ticketId: string): Promise<void> {
    await this.supabase
      .getClient()
      .from('helpdesk_tickets')
      .update({
        sla_paused_at: new Date().toISOString(),
      })
      .eq('id', ticketId)
      .is('sla_paused_at', null);
  }

  /**
   * Resume SLA timer for a ticket
   */
  async resumeSla(ticketId: string): Promise<void> {
    const { data: ticket } = await this.supabase
      .getClient()
      .from('helpdesk_tickets')
      .select('sla_paused_at, sla_pause_duration_minutes, due_at, first_response_due_at')
      .eq('id', ticketId)
      .single();

    if (!ticket?.sla_paused_at) return;

    const pausedAt = new Date(ticket.sla_paused_at);
    const now = new Date();
    const pauseMinutes = Math.floor((now.getTime() - pausedAt.getTime()) / 60000);
    const totalPauseMinutes = (ticket.sla_pause_duration_minutes || 0) + pauseMinutes;

    // Extend due dates by pause duration
    const newDueAt = ticket.due_at 
      ? new Date(new Date(ticket.due_at).getTime() + pauseMinutes * 60000).toISOString()
      : null;
    const newFirstResponseDue = ticket.first_response_due_at
      ? new Date(new Date(ticket.first_response_due_at).getTime() + pauseMinutes * 60000).toISOString()
      : null;

    await this.supabase
      .getClient()
      .from('helpdesk_tickets')
      .update({
        sla_paused_at: null,
        sla_pause_duration_minutes: totalPauseMinutes,
        due_at: newDueAt,
        first_response_due_at: newFirstResponseDue,
      })
      .eq('id', ticketId);
  }
}
