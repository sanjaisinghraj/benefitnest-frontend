import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';

@Injectable()
export class EscalationService {
  constructor(private supabase: SupabaseService) {}

  // Get all escalations
  async findAll(options: {
    limit?: number;
    offset?: number;
    status?: string;
    priority?: string;
    tenantCode?: string;
  }) {
    const { limit = 20, offset = 0, status, priority, tenantCode } = options;

    let query = this.supabase
      .getClient()
      .from('escalations')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) query = query.eq('status', status);
    if (priority) query = query.eq('priority', priority);
    if (tenantCode) query = query.eq('tenant_code', tenantCode);

    const { data, error, count } = await query;
    if (error) throw error;

    return { success: true, data: data || [], total: count };
  }

  // Get single escalation
  async findOne(id: string) {
    const { data, error } = await this.supabase
      .getClient()
      .from('escalations')
      .select('*, escalation_comments(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return { success: true, data };
  }

  // Create escalation
  async create(escalationDto: any) {
    const { data, error } = await this.supabase
      .getClient()
      .from('escalations')
      .insert({
        title: escalationDto.title,
        description: escalationDto.description,
        category: escalationDto.category,
        priority: escalationDto.priority || 'medium',
        status: 'open',
        employee_id: escalationDto.employeeId,
        employee_email: escalationDto.employeeEmail,
        employee_name: escalationDto.employeeName,
        tenant_code: escalationDto.tenantCode,
        assigned_to: escalationDto.assignedTo,
        claim_id: escalationDto.claimId,
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, message: 'Escalation created', data };
  }

  // Update escalation
  async update(id: string, updateDto: any) {
    const { data, error } = await this.supabase
      .getClient()
      .from('escalations')
      .update({
        ...updateDto,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { success: true, message: 'Escalation updated', data };
  }

  // Update status
  async updateStatus(id: string, status: string, resolution?: string) {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === 'resolved' || status === 'closed') {
      updateData.resolved_at = new Date().toISOString();
      if (resolution) updateData.resolution = resolution;
    }

    const { data, error } = await this.supabase
      .getClient()
      .from('escalations')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { success: true, message: 'Status updated', data };
  }

  // Assign escalation
  async assign(id: string, assignedTo: string) {
    const { data, error } = await this.supabase
      .getClient()
      .from('escalations')
      .update({
        assigned_to: assignedTo,
        status: 'in_progress',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { success: true, message: 'Escalation assigned', data };
  }

  // Add comment
  async addComment(escalationId: string, commentDto: any) {
    const { data, error } = await this.supabase
      .getClient()
      .from('escalation_comments')
      .insert({
        escalation_id: escalationId,
        comment: commentDto.comment,
        author_id: commentDto.authorId,
        author_name: commentDto.authorName,
        is_internal: commentDto.isInternal || false,
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, message: 'Comment added', data };
  }

  // Get comments
  async getComments(escalationId: string) {
    const { data, error } = await this.supabase
      .getClient()
      .from('escalation_comments')
      .select('*')
      .eq('escalation_id', escalationId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return { success: true, data: data || [] };
  }

  // Get escalation stats
  async getStats(tenantCode?: string) {
    let query = this.supabase.getClient().from('escalations').select('status, priority');
    if (tenantCode) query = query.eq('tenant_code', tenantCode);

    const { data, error } = await query;
    if (error) throw error;

    const stats = {
      total: data?.length || 0,
      byStatus: {},
      byPriority: {},
    };

    data?.forEach((item) => {
      stats.byStatus[item.status] = (stats.byStatus[item.status] || 0) + 1;
      stats.byPriority[item.priority] = (stats.byPriority[item.priority] || 0) + 1;
    });

    return { success: true, data: stats };
  }
}
