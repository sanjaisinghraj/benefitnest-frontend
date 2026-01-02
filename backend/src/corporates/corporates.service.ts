import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';

@Injectable()
export class CorporatesService {
  constructor(private supabase: SupabaseService) {}

  // Helper functions
  private sanitizeString(str: any): string | null {
    return str?.toString().trim() || null;
  }

  private sanitizeCode(str: any): string | null {
    return str?.toString().trim().toUpperCase().replace(/[^A-Z0-9]/g, '') || null;
  }

  private sanitizeSubdomain(str: any): string | null {
    return str?.toString().trim().toLowerCase().replace(/[^a-z0-9]/g, '') || null;
  }

  // Get all corporates with filtering, pagination, and sorting
  async findAll(options: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
    search?: string;
    status?: string;
    industryType?: string;
    corporateType?: string;
    brokerId?: string;
    contractExpiringDays?: number;
    tags?: string[];
  }) {
    const {
      page = 1,
      limit = 1000,
      sortBy = 'created_at',
      sortOrder = 'desc',
      search = '',
      status,
      industryType,
      corporateType,
      brokerId,
      contractExpiringDays,
      tags,
    } = options;

    const offset = (page - 1) * limit;

    let query = this.supabase
      .getClient()
      .from('tenants')
      .select(
        `*,
        broker:brokers(broker_id, broker_name, broker_code)`,
        { count: 'exact' },
      );

    // Search filter
    if (search) {
      query = query.or(
        `tenant_code.ilike.%${search}%,subdomain.ilike.%${search}%,corporate_legal_name.ilike.%${search}%,industry_type.ilike.%${search}%`,
      );
    }

    // Apply filters
    if (status) query = query.eq('status', status);
    if (industryType) query = query.eq('industry_type', industryType);
    if (corporateType) query = query.eq('corporate_type', corporateType);
    if (brokerId) query = query.eq('broker_id', brokerId);
    if (tags && tags.length > 0) query = query.overlaps('tags', tags);

    // Contract expiring filter
    if (contractExpiringDays) {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + contractExpiringDays);
      query = query.lte('contract_end_date', expiryDate.toISOString().split('T')[0]);
      query = query.gte('contract_end_date', new Date().toISOString().split('T')[0]);
    }

    // Sort
    const validSortFields = [
      'created_at',
      'corporate_legal_name',
      'tenant_code',
      'status',
      'health_score',
      'contract_end_date',
    ];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    query = query.order(sortField, { ascending: sortOrder === 'asc' });

    // Pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    const totalPages = Math.ceil((count || 0) / limit);

    return {
      success: true,
      data: data || [],
      pagination: {
        page,
        limit,
        total: count,
        total_pages: totalPages,
        has_next: page < totalPages,
        has_prev: page > 1,
      },
    };
  }

  // Get corporate statistics
  async getStatistics(brokerId?: string) {
    const statuses = ['ACTIVE', 'INACTIVE', 'ON_HOLD'];
    const statusCounts: Record<string, number> = {};

    for (const status of statuses) {
      let query = this.supabase
        .getClient()
        .from('tenants')
        .select('*', { count: 'exact', head: true })
        .eq('status', status);

      if (brokerId) query = query.eq('broker_id', brokerId);
      const { count } = await query;
      statusCounts[status] = count || 0;
    }

    // Get total count
    let totalQuery = this.supabase
      .getClient()
      .from('tenants')
      .select('*', { count: 'exact', head: true });
    if (brokerId) totalQuery = totalQuery.eq('broker_id', brokerId);
    const { count: totalCount } = await totalQuery;

    // Get contracts expiring soon (next 90 days)
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 90);
    let expiringQuery = this.supabase
      .getClient()
      .from('tenants')
      .select('*', { count: 'exact', head: true })
      .lte('contract_end_date', expiryDate.toISOString().split('T')[0])
      .gte('contract_end_date', new Date().toISOString().split('T')[0]);
    if (brokerId) expiringQuery = expiringQuery.eq('broker_id', brokerId);
    const { count: expiringCount } = await expiringQuery;

    return {
      success: true,
      statistics: {
        total: totalCount || 0,
        by_status: statusCounts,
        expiring_soon: expiringCount || 0,
      },
    };
  }

  // Get single corporate by ID
  async findOne(id: string) {
    const { data, error } = await this.supabase
      .getClient()
      .from('tenants')
      .select(
        `*,
        broker:brokers(broker_id, broker_name, broker_code)`,
      )
      .eq('tenant_id', id)
      .single();

    if (error) throw error;

    return { success: true, data };
  }

  // Create new corporate
  async create(createDto: any) {
    const tenantData = {
      tenant_code: this.sanitizeCode(createDto.tenant_code),
      subdomain: this.sanitizeSubdomain(createDto.subdomain),
      corporate_legal_name: this.sanitizeString(createDto.corporate_legal_name),
      industry_type: createDto.industry_type || null,
      corporate_type: createDto.corporate_type || 'CORPORATE',
      status: createDto.status || 'ACTIVE',
      broker_id: createDto.broker_id || null,
      contract_start_date: createDto.contract_start_date || null,
      contract_end_date: createDto.contract_end_date || null,
      primary_contact_name: createDto.primary_contact_name || null,
      primary_contact_email: createDto.primary_contact_email || null,
      primary_contact_phone: createDto.primary_contact_phone || null,
      address_line1: createDto.address_line1 || null,
      address_line2: createDto.address_line2 || null,
      city: createDto.city || null,
      state: createDto.state || null,
      country: createDto.country || 'India',
      pincode: createDto.pincode || null,
      tags: createDto.tags || [],
      notes: createDto.notes || null,
    };

    const { data, error } = await this.supabase
      .getClient()
      .from('tenants')
      .insert(tenantData)
      .select()
      .single();

    if (error) throw error;

    return { success: true, message: 'Corporate created successfully', data };
  }

  // Update corporate
  async update(id: string, updateDto: any) {
    const updateData: any = {};

    if (updateDto.corporate_legal_name)
      updateData.corporate_legal_name = this.sanitizeString(updateDto.corporate_legal_name);
    if (updateDto.subdomain) updateData.subdomain = this.sanitizeSubdomain(updateDto.subdomain);
    if (updateDto.industry_type) updateData.industry_type = updateDto.industry_type;
    if (updateDto.corporate_type) updateData.corporate_type = updateDto.corporate_type;
    if (updateDto.status) updateData.status = updateDto.status;
    if (updateDto.broker_id !== undefined) updateData.broker_id = updateDto.broker_id;
    if (updateDto.contract_start_date) updateData.contract_start_date = updateDto.contract_start_date;
    if (updateDto.contract_end_date) updateData.contract_end_date = updateDto.contract_end_date;
    if (updateDto.primary_contact_name) updateData.primary_contact_name = updateDto.primary_contact_name;
    if (updateDto.primary_contact_email) updateData.primary_contact_email = updateDto.primary_contact_email;
    if (updateDto.primary_contact_phone) updateData.primary_contact_phone = updateDto.primary_contact_phone;
    if (updateDto.address_line1) updateData.address_line1 = updateDto.address_line1;
    if (updateDto.address_line2) updateData.address_line2 = updateDto.address_line2;
    if (updateDto.city) updateData.city = updateDto.city;
    if (updateDto.state) updateData.state = updateDto.state;
    if (updateDto.country) updateData.country = updateDto.country;
    if (updateDto.pincode) updateData.pincode = updateDto.pincode;
    if (updateDto.tags) updateData.tags = updateDto.tags;
    if (updateDto.notes) updateData.notes = updateDto.notes;

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await this.supabase
      .getClient()
      .from('tenants')
      .update(updateData)
      .eq('tenant_id', id)
      .select()
      .single();

    if (error) throw error;

    return { success: true, message: 'Corporate updated successfully', data };
  }

  // Delete corporate
  async delete(id: string) {
    const { error } = await this.supabase
      .getClient()
      .from('tenants')
      .delete()
      .eq('tenant_id', id);

    if (error) throw error;

    return { success: true, message: 'Corporate deleted successfully' };
  }

  // Get corporate contacts
  async getContacts(id: string) {
    const { data, error } = await this.supabase
      .getClient()
      .from('corporate_contacts')
      .select('*')
      .eq('tenant_id', id)
      .order('is_primary', { ascending: false });

    if (error) throw error;

    return { success: true, data: data || [] };
  }

  // Add contact to corporate
  async addContact(id: string, contactDto: any) {
    const { data, error } = await this.supabase
      .getClient()
      .from('corporate_contacts')
      .insert({
        tenant_id: id,
        contact_name: contactDto.contact_name,
        contact_email: contactDto.contact_email,
        contact_phone: contactDto.contact_phone,
        contact_role: contactDto.contact_role,
        is_primary: contactDto.is_primary || false,
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, message: 'Contact added successfully', data };
  }

  // Get portal customizations
  async getCustomizations(id: string) {
    const { data, error } = await this.supabase
      .getClient()
      .from('portal_customizations')
      .select('*')
      .eq('tenant_id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    return { success: true, data: data || null };
  }

  // Get marketplace settings
  async getMarketplaceSettings(id: string) {
    const { data, error } = await this.supabase
      .getClient()
      .from('marketplace_settings')
      .select('*')
      .eq('tenant_id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    return { success: true, data: data || null };
  }

  // Update marketplace settings
  async updateMarketplaceSettings(id: string, settingsDto: any) {
    // Try to update first
    const { data: existing } = await this.supabase
      .getClient()
      .from('marketplace_settings')
      .select('id')
      .eq('tenant_id', id)
      .single();

    let result;
    if (existing) {
      result = await this.supabase
        .getClient()
        .from('marketplace_settings')
        .update({ ...settingsDto, updated_at: new Date().toISOString() })
        .eq('tenant_id', id)
        .select()
        .single();
    } else {
      result = await this.supabase
        .getClient()
        .from('marketplace_settings')
        .insert({ tenant_id: id, ...settingsDto })
        .select()
        .single();
    }

    if (result.error) throw result.error;

    return { success: true, message: 'Marketplace settings saved', data: result.data };
  }

  // Get testers for corporate
  async getTesters(id: string) {
    const { data, error } = await this.supabase
      .getClient()
      .from('portal_testers')
      .select('*')
      .eq('tenant_id', id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { success: true, data: data || [] };
  }

  // Add tester
  async addTester(id: string, testerDto: any) {
    const { data, error } = await this.supabase
      .getClient()
      .from('portal_testers')
      .insert({
        tenant_id: id,
        email: testerDto.email,
        name: testerDto.name,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, message: 'Tester added', data };
  }

  // Delete tester
  async deleteTester(id: string, testerId: string) {
    const { error } = await this.supabase
      .getClient()
      .from('portal_testers')
      .delete()
      .eq('id', testerId)
      .eq('tenant_id', id);

    if (error) throw error;

    return { success: true, message: 'Tester removed' };
  }
}
