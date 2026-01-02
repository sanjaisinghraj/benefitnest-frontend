import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';

@Injectable()
export class PortalService {
  constructor(private supabase: SupabaseService) {}

  // Get portal configuration
  async getConfig(tenantCode: string) {
    const { data, error } = await this.supabase
      .getClient()
      .from('portal_config')
      .select('*')
      .eq('tenant_code', tenantCode)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return { success: true, data: data || null };
  }

  // Update portal configuration
  async updateConfig(tenantCode: string, configDto: any) {
    const { data: existing } = await this.supabase
      .getClient()
      .from('portal_config')
      .select('id')
      .eq('tenant_code', tenantCode)
      .single();

    let result;
    if (existing) {
      const { data, error } = await this.supabase
        .getClient()
        .from('portal_config')
        .update({
          ...configDto,
          updated_at: new Date().toISOString(),
        })
        .eq('tenant_code', tenantCode)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await this.supabase
        .getClient()
        .from('portal_config')
        .insert({
          tenant_code: tenantCode,
          ...configDto,
        })
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    return { success: true, message: 'Config updated', data: result };
  }

  // Get portal announcements
  async getAnnouncements(tenantCode: string) {
    const { data, error } = await this.supabase
      .getClient()
      .from('portal_announcements')
      .select('*')
      .eq('tenant_code', tenantCode)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data: data || [] };
  }

  // Create announcement
  async createAnnouncement(announcementDto: any) {
    const { data, error } = await this.supabase
      .getClient()
      .from('portal_announcements')
      .insert({
        tenant_code: announcementDto.tenantCode,
        title: announcementDto.title,
        content: announcementDto.content,
        priority: announcementDto.priority || 'normal',
        is_active: true,
        start_date: announcementDto.startDate,
        end_date: announcementDto.endDate,
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, message: 'Announcement created', data };
  }

  // Update announcement
  async updateAnnouncement(id: string, updateDto: any) {
    const { data, error } = await this.supabase
      .getClient()
      .from('portal_announcements')
      .update({
        ...updateDto,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { success: true, message: 'Announcement updated', data };
  }

  // Delete announcement
  async deleteAnnouncement(id: string) {
    const { error } = await this.supabase
      .getClient()
      .from('portal_announcements')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true, message: 'Announcement deleted' };
  }

  // Get quick links
  async getQuickLinks(tenantCode: string) {
    const { data, error } = await this.supabase
      .getClient()
      .from('portal_quick_links')
      .select('*')
      .eq('tenant_code', tenantCode)
      .order('display_order', { ascending: true });

    if (error) throw error;
    return { success: true, data: data || [] };
  }

  // Create quick link
  async createQuickLink(linkDto: any) {
    const { data, error } = await this.supabase
      .getClient()
      .from('portal_quick_links')
      .insert({
        tenant_code: linkDto.tenantCode,
        title: linkDto.title,
        url: linkDto.url,
        icon: linkDto.icon,
        display_order: linkDto.displayOrder || 0,
        is_external: linkDto.isExternal || false,
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, message: 'Quick link created', data };
  }

  // Update quick link
  async updateQuickLink(id: string, updateDto: any) {
    const { data, error } = await this.supabase
      .getClient()
      .from('portal_quick_links')
      .update(updateDto)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { success: true, message: 'Quick link updated', data };
  }

  // Delete quick link
  async deleteQuickLink(id: string) {
    const { error } = await this.supabase.getClient().from('portal_quick_links').delete().eq('id', id);
    if (error) throw error;
    return { success: true, message: 'Quick link deleted' };
  }

  // Get FAQs
  async getFaqs(tenantCode: string) {
    const { data, error } = await this.supabase
      .getClient()
      .from('portal_faqs')
      .select('*')
      .eq('tenant_code', tenantCode)
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) throw error;
    return { success: true, data: data || [] };
  }

  // Create FAQ
  async createFaq(faqDto: any) {
    const { data, error } = await this.supabase
      .getClient()
      .from('portal_faqs')
      .insert({
        tenant_code: faqDto.tenantCode,
        category: faqDto.category,
        question: faqDto.question,
        answer: faqDto.answer,
        display_order: faqDto.displayOrder || 0,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, message: 'FAQ created', data };
  }

  // Update FAQ
  async updateFaq(id: string, updateDto: any) {
    const { data, error } = await this.supabase
      .getClient()
      .from('portal_faqs')
      .update(updateDto)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { success: true, message: 'FAQ updated', data };
  }

  // Delete FAQ
  async deleteFaq(id: string) {
    const { error } = await this.supabase.getClient().from('portal_faqs').delete().eq('id', id);
    if (error) throw error;
    return { success: true, message: 'FAQ deleted' };
  }
}
