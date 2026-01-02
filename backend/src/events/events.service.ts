import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';

@Injectable()
export class EventsService {
  constructor(private supabase: SupabaseService) {}

  // Get all events
  async findAll(options: { limit?: number; offset?: number; status?: string; category?: string }) {
    const { limit = 20, offset = 0, status, category } = options;

    let query = this.supabase
      .getClient()
      .from('events')
      .select('*, event_registrations(count)', { count: 'exact' })
      .order('start_date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) query = query.eq('status', status);
    if (category) query = query.eq('category', category);

    const { data, error, count } = await query;
    if (error) throw error;

    return { success: true, data: data || [], total: count };
  }

  // Get single event
  async findOne(id: string) {
    const { data, error } = await this.supabase
      .getClient()
      .from('events')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return { success: true, data };
  }

  // Create event
  async create(eventDto: any) {
    const { data, error } = await this.supabase
      .getClient()
      .from('events')
      .insert({
        title: eventDto.title,
        description: eventDto.description,
        category: eventDto.category,
        event_type: eventDto.eventType,
        start_date: eventDto.startDate,
        end_date: eventDto.endDate,
        start_time: eventDto.startTime,
        end_time: eventDto.endTime,
        location: eventDto.location,
        virtual_link: eventDto.virtualLink,
        max_attendees: eventDto.maxAttendees,
        status: eventDto.status || 'draft',
        image_url: eventDto.imageUrl,
        created_by: eventDto.createdBy,
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, message: 'Event created', data };
  }

  // Update event
  async update(id: string, updateDto: any) {
    const { data, error } = await this.supabase
      .getClient()
      .from('events')
      .update({
        ...updateDto,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { success: true, message: 'Event updated', data };
  }

  // Delete event
  async delete(id: string) {
    const { error } = await this.supabase.getClient().from('events').delete().eq('id', id);
    if (error) throw error;
    return { success: true, message: 'Event deleted' };
  }

  // Assign event to tenants
  async assignToTenants(eventId: string, tenantCodes: string[]) {
    // Remove existing assignments
    await this.supabase.getClient().from('event_tenants').delete().eq('event_id', eventId);

    // Add new assignments
    if (tenantCodes.length > 0) {
      const assignments = tenantCodes.map((code) => ({
        event_id: eventId,
        tenant_code: code,
      }));

      const { error } = await this.supabase.getClient().from('event_tenants').insert(assignments);
      if (error) throw error;
    }

    return { success: true, message: 'Event assigned to tenants' };
  }

  // Get event registrations
  async getRegistrations(eventId: string) {
    const { data, error } = await this.supabase
      .getClient()
      .from('event_registrations')
      .select('*')
      .eq('event_id', eventId)
      .order('registered_at', { ascending: false });

    if (error) throw error;
    return { success: true, data: data || [] };
  }

  // Register for event
  async register(eventId: string, registrationDto: any) {
    const { data, error } = await this.supabase
      .getClient()
      .from('event_registrations')
      .insert({
        event_id: eventId,
        employee_id: registrationDto.employeeId,
        employee_email: registrationDto.employeeEmail,
        employee_name: registrationDto.employeeName,
        tenant_code: registrationDto.tenantCode,
        status: 'registered',
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, message: 'Registered successfully', data };
  }

  // Mark attendance
  async markAttendance(eventId: string, employeeId: string, attended: boolean) {
    const { error } = await this.supabase
      .getClient()
      .from('event_registrations')
      .update({
        attended,
        attended_at: attended ? new Date().toISOString() : null,
      })
      .eq('event_id', eventId)
      .eq('employee_id', employeeId);

    if (error) throw error;
    return { success: true, message: 'Attendance updated' };
  }
}
