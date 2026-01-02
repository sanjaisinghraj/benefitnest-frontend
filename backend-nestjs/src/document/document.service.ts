import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';

@Injectable()
export class DocumentService {
  constructor(private supabase: SupabaseService) {}

  // Get all documents
  async findAll(options: {
    tenantCode?: string;
    category?: string;
    employeeId?: string;
    limit?: number;
    offset?: number;
  }) {
    const { tenantCode, category, employeeId, limit = 50, offset = 0 } = options;

    let query = this.supabase
      .getClient()
      .from('documents')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (tenantCode) query = query.eq('tenant_code', tenantCode);
    if (category) query = query.eq('category', category);
    if (employeeId) query = query.eq('employee_id', employeeId);

    const { data, error, count } = await query;
    if (error) throw error;

    return { success: true, data: data || [], total: count };
  }

  // Get single document
  async findOne(id: string) {
    const { data, error } = await this.supabase
      .getClient()
      .from('documents')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return { success: true, data };
  }

  // Create document record
  async create(documentDto: any) {
    const { data, error } = await this.supabase
      .getClient()
      .from('documents')
      .insert({
        tenant_code: documentDto.tenantCode,
        employee_id: documentDto.employeeId,
        name: documentDto.name,
        category: documentDto.category,
        document_type: documentDto.documentType,
        file_url: documentDto.fileUrl,
        file_name: documentDto.fileName,
        file_size: documentDto.fileSize,
        mime_type: documentDto.mimeType,
        uploaded_by: documentDto.uploadedBy,
        metadata: documentDto.metadata || {},
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, message: 'Document created', data };
  }

  // Update document
  async update(id: string, updateDto: any) {
    const { data, error } = await this.supabase
      .getClient()
      .from('documents')
      .update({
        ...updateDto,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { success: true, message: 'Document updated', data };
  }

  // Delete document
  async delete(id: string) {
    const { error } = await this.supabase.getClient().from('documents').delete().eq('id', id);
    if (error) throw error;
    return { success: true, message: 'Document deleted' };
  }

  // Generate signed upload URL
  async getUploadUrl(fileName: string, contentType: string, folder: string = 'documents') {
    const filePath = `${folder}/${Date.now()}-${fileName}`;
    
    const { data, error } = await this.supabase
      .getClient()
      .storage
      .from('uploads')
      .createSignedUploadUrl(filePath);

    if (error) throw error;
    return { 
      success: true, 
      data: { 
        uploadUrl: data.signedUrl, 
        filePath,
        token: data.token
      } 
    };
  }

  // Generate signed download URL
  async getDownloadUrl(filePath: string) {
    const { data, error } = await this.supabase
      .getClient()
      .storage
      .from('uploads')
      .createSignedUrl(filePath, 3600); // 1 hour expiry

    if (error) throw error;
    return { success: true, data: { downloadUrl: data.signedUrl } };
  }

  // Get document templates
  async getTemplates(tenantCode?: string) {
    let query = this.supabase
      .getClient()
      .from('document_templates')
      .select('*')
      .order('name', { ascending: true });

    if (tenantCode) {
      query = query.or(`tenant_code.eq.${tenantCode},is_global.eq.true`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return { success: true, data: data || [] };
  }

  // Create document template
  async createTemplate(templateDto: any) {
    const { data, error } = await this.supabase
      .getClient()
      .from('document_templates')
      .insert({
        name: templateDto.name,
        category: templateDto.category,
        description: templateDto.description,
        template_content: templateDto.templateContent,
        variables: templateDto.variables || [],
        tenant_code: templateDto.tenantCode,
        is_global: templateDto.isGlobal || false,
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, message: 'Template created', data };
  }

  // Update template
  async updateTemplate(id: string, updateDto: any) {
    const { data, error } = await this.supabase
      .getClient()
      .from('document_templates')
      .update(updateDto)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { success: true, message: 'Template updated', data };
  }

  // Delete template
  async deleteTemplate(id: string) {
    const { error } = await this.supabase.getClient().from('document_templates').delete().eq('id', id);
    if (error) throw error;
    return { success: true, message: 'Template deleted' };
  }
}
