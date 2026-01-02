import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';

@Injectable()
export class MastersService {
  constructor(private supabase: SupabaseService) {}

  // Generic master data operations
  private async getMasterData(tableName: string, tenantCode?: string) {
    let query = this.supabase
      .getClient()
      .from(tableName)
      .select('*')
      .order('name', { ascending: true });

    if (tenantCode) {
      query = query.or(`tenant_code.eq.${tenantCode},is_global.eq.true`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return { success: true, data: data || [] };
  }

  private async createMasterData(tableName: string, dto: any) {
    const { data, error } = await this.supabase
      .getClient()
      .from(tableName)
      .insert(dto)
      .select()
      .single();

    if (error) throw error;
    return { success: true, message: 'Created successfully', data };
  }

  private async updateMasterData(tableName: string, id: string, dto: any) {
    const { data, error } = await this.supabase
      .getClient()
      .from(tableName)
      .update({ ...dto, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { success: true, message: 'Updated successfully', data };
  }

  private async deleteMasterData(tableName: string, id: string) {
    const { error } = await this.supabase.getClient().from(tableName).delete().eq('id', id);
    if (error) throw error;
    return { success: true, message: 'Deleted successfully' };
  }

  // Relationship types
  async getRelationships(tenantCode?: string) {
    return this.getMasterData('master_relationships', tenantCode);
  }

  async createRelationship(dto: any) {
    return this.createMasterData('master_relationships', {
      code: dto.code,
      name: dto.name,
      description: dto.description,
      tenant_code: dto.tenantCode,
      is_global: dto.isGlobal || false,
      is_active: true,
    });
  }

  async updateRelationship(id: string, dto: any) {
    return this.updateMasterData('master_relationships', id, dto);
  }

  async deleteRelationship(id: string) {
    return this.deleteMasterData('master_relationships', id);
  }

  // Designations
  async getDesignations(tenantCode?: string) {
    return this.getMasterData('master_designations', tenantCode);
  }

  async createDesignation(dto: any) {
    return this.createMasterData('master_designations', {
      code: dto.code,
      name: dto.name,
      level: dto.level,
      tenant_code: dto.tenantCode,
      is_global: dto.isGlobal || false,
      is_active: true,
    });
  }

  async updateDesignation(id: string, dto: any) {
    return this.updateMasterData('master_designations', id, dto);
  }

  async deleteDesignation(id: string) {
    return this.deleteMasterData('master_designations', id);
  }

  // Departments
  async getDepartments(tenantCode?: string) {
    return this.getMasterData('master_departments', tenantCode);
  }

  async createDepartment(dto: any) {
    return this.createMasterData('master_departments', {
      code: dto.code,
      name: dto.name,
      description: dto.description,
      tenant_code: dto.tenantCode,
      is_global: dto.isGlobal || false,
      is_active: true,
    });
  }

  async updateDepartment(id: string, dto: any) {
    return this.updateMasterData('master_departments', id, dto);
  }

  async deleteDepartment(id: string) {
    return this.deleteMasterData('master_departments', id);
  }

  // Locations
  async getLocations(tenantCode?: string) {
    return this.getMasterData('master_locations', tenantCode);
  }

  async createLocation(dto: any) {
    return this.createMasterData('master_locations', {
      code: dto.code,
      name: dto.name,
      city: dto.city,
      state: dto.state,
      country: dto.country,
      address: dto.address,
      tenant_code: dto.tenantCode,
      is_global: dto.isGlobal || false,
      is_active: true,
    });
  }

  async updateLocation(id: string, dto: any) {
    return this.updateMasterData('master_locations', id, dto);
  }

  async deleteLocation(id: string) {
    return this.deleteMasterData('master_locations', id);
  }

  // Sum Insured options
  async getSumInsuredOptions(tenantCode?: string) {
    return this.getMasterData('master_sum_insured', tenantCode);
  }

  async createSumInsuredOption(dto: any) {
    return this.createMasterData('master_sum_insured', {
      value: dto.value,
      label: dto.label,
      product_type: dto.productType,
      tenant_code: dto.tenantCode,
      is_global: dto.isGlobal || false,
      is_active: true,
    });
  }

  async updateSumInsuredOption(id: string, dto: any) {
    return this.updateMasterData('master_sum_insured', id, dto);
  }

  async deleteSumInsuredOption(id: string) {
    return this.deleteMasterData('master_sum_insured', id);
  }

  // Claim types
  async getClaimTypes(tenantCode?: string) {
    return this.getMasterData('master_claim_types', tenantCode);
  }

  async createClaimType(dto: any) {
    return this.createMasterData('master_claim_types', {
      code: dto.code,
      name: dto.name,
      description: dto.description,
      product_type: dto.productType,
      tenant_code: dto.tenantCode,
      is_global: dto.isGlobal || false,
      is_active: true,
    });
  }

  async updateClaimType(id: string, dto: any) {
    return this.updateMasterData('master_claim_types', id, dto);
  }

  async deleteClaimType(id: string) {
    return this.deleteMasterData('master_claim_types', id);
  }

  // Document types
  async getDocumentTypes(tenantCode?: string) {
    return this.getMasterData('master_document_types', tenantCode);
  }

  async createDocumentType(dto: any) {
    return this.createMasterData('master_document_types', {
      code: dto.code,
      name: dto.name,
      description: dto.description,
      category: dto.category,
      is_mandatory: dto.isMandatory || false,
      tenant_code: dto.tenantCode,
      is_global: dto.isGlobal || false,
      is_active: true,
    });
  }

  async updateDocumentType(id: string, dto: any) {
    return this.updateMasterData('master_document_types', id, dto);
  }

  async deleteDocumentType(id: string) {
    return this.deleteMasterData('master_document_types', id);
  }

  // All masters in one call
  async getAllMasters(tenantCode?: string) {
    const [relationships, designations, departments, locations, sumInsured, claimTypes, documentTypes] =
      await Promise.all([
        this.getRelationships(tenantCode),
        this.getDesignations(tenantCode),
        this.getDepartments(tenantCode),
        this.getLocations(tenantCode),
        this.getSumInsuredOptions(tenantCode),
        this.getClaimTypes(tenantCode),
        this.getDocumentTypes(tenantCode),
      ]);

    return {
      success: true,
      data: {
        relationships: relationships.data,
        designations: designations.data,
        departments: departments.data,
        locations: locations.data,
        sumInsured: sumInsured.data,
        claimTypes: claimTypes.data,
        documentTypes: documentTypes.data,
      },
    };
  }
}
