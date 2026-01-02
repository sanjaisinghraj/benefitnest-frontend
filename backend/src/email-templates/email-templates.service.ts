import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';

@Injectable()
export class EmailTemplatesService {
  constructor(private supabase: SupabaseService) {}

  // Get all email templates
  async findAll(options: { tenantCode?: string; category?: string; isActive?: boolean }) {
    const { tenantCode, category, isActive } = options;

    let query = this.supabase
      .getClient()
      .from('email_templates')
      .select('*')
      .order('name', { ascending: true });

    if (tenantCode) {
      query = query.or(`tenant_code.eq.${tenantCode},is_global.eq.true`);
    }
    if (category) query = query.eq('category', category);
    if (isActive !== undefined) query = query.eq('is_active', isActive);

    const { data, error } = await query;
    if (error) throw error;
    return { success: true, data: data || [] };
  }

  // Get single email template
  async findOne(id: string) {
    const { data, error } = await this.supabase
      .getClient()
      .from('email_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return { success: true, data };
  }

  // Get template by code and tenant
  async findByCode(templateCode: string, tenantCode?: string) {
    let query = this.supabase
      .getClient()
      .from('email_templates')
      .select('*')
      .eq('template_code', templateCode)
      .eq('is_active', true);

    // First try tenant-specific, then global
    if (tenantCode) {
      const { data: tenantTemplate } = await query.eq('tenant_code', tenantCode).single();
      if (tenantTemplate) {
        return { success: true, data: tenantTemplate };
      }
    }

    // Fallback to global template
    const { data, error } = await query.eq('is_global', true).single();
    if (error && error.code !== 'PGRST116') throw error;
    return { success: true, data: data || null };
  }

  // Create email template
  async create(templateDto: any) {
    const { data, error } = await this.supabase
      .getClient()
      .from('email_templates')
      .insert({
        template_code: templateDto.templateCode,
        name: templateDto.name,
        category: templateDto.category,
        subject: templateDto.subject,
        html_content: templateDto.htmlContent,
        text_content: templateDto.textContent,
        variables: templateDto.variables || [],
        tenant_code: templateDto.tenantCode,
        is_global: templateDto.isGlobal || false,
        is_active: templateDto.isActive !== false,
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, message: 'Email template created', data };
  }

  // Update email template
  async update(id: string, updateDto: any) {
    const { data, error } = await this.supabase
      .getClient()
      .from('email_templates')
      .update({
        ...updateDto,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { success: true, message: 'Email template updated', data };
  }

  // Delete email template
  async delete(id: string) {
    const { error } = await this.supabase.getClient().from('email_templates').delete().eq('id', id);
    if (error) throw error;
    return { success: true, message: 'Email template deleted' };
  }

  // Duplicate template
  async duplicate(id: string, newName: string, tenantCode?: string) {
    const { data: original, error: fetchError } = await this.supabase
      .getClient()
      .from('email_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    const { data, error } = await this.supabase
      .getClient()
      .from('email_templates')
      .insert({
        template_code: `${original.template_code}_copy_${Date.now()}`,
        name: newName,
        category: original.category,
        subject: original.subject,
        html_content: original.html_content,
        text_content: original.text_content,
        variables: original.variables,
        tenant_code: tenantCode || original.tenant_code,
        is_global: false,
        is_active: false,
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, message: 'Template duplicated', data };
  }

  // Get template categories
  async getCategories() {
    const categories = [
      { code: 'enrollment', name: 'Enrollment' },
      { code: 'claims', name: 'Claims' },
      { code: 'wellness', name: 'Wellness' },
      { code: 'notifications', name: 'Notifications' },
      { code: 'surveys', name: 'Surveys' },
      { code: 'events', name: 'Events' },
      { code: 'onboarding', name: 'Onboarding' },
      { code: 'general', name: 'General' },
    ];

    return { success: true, data: categories };
  }

  // Preview template with sample data
  async preview(id: string, sampleData: Record<string, any>) {
    const { data: template, error } = await this.supabase
      .getClient()
      .from('email_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    let previewHtml = template.html_content;
    let previewSubject = template.subject;

    // Replace variables with sample data
    for (const [key, value] of Object.entries(sampleData)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      previewHtml = previewHtml.replace(regex, String(value));
      previewSubject = previewSubject.replace(regex, String(value));
    }

    return {
      success: true,
      data: {
        subject: previewSubject,
        html: previewHtml,
      },
    };
  }
}
