import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class EmployeesService {
  constructor(private supabase: SupabaseService) {}

  // Get all employees
  async findAll(options: {
    tenantCode?: string;
    limit?: number;
    offset?: number;
    search?: string;
    status?: string;
    department?: string;
  }) {
    const { tenantCode, limit = 50, offset = 0, search, status, department } = options;

    let query = this.supabase
      .getClient()
      .from('employees')
      .select('*, employee_dependents(count)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (tenantCode) query = query.eq('tenant_code', tenantCode);
    if (status) query = query.eq('status', status);
    if (department) query = query.eq('department', department);
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,employee_id.ilike.%${search}%`);
    }

    const { data, error, count } = await query;
    if (error) throw error;

    return { success: true, data: data || [], total: count };
  }

  // Get single employee
  async findOne(id: string) {
    const { data, error } = await this.supabase
      .getClient()
      .from('employees')
      .select('*, employee_dependents(*), employee_enrollments(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return { success: true, data };
  }

  // Get employee by employee_id and tenant
  async findByEmployeeId(employeeId: string, tenantCode: string) {
    const { data, error } = await this.supabase
      .getClient()
      .from('employees')
      .select('*, employee_dependents(*)')
      .eq('employee_id', employeeId)
      .eq('tenant_code', tenantCode)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return { success: true, data: data || null };
  }

  // Create employee
  async create(employeeDto: any) {
    const hashedPassword = employeeDto.password
      ? await bcrypt.hash(employeeDto.password, 10)
      : await bcrypt.hash('Welcome@123', 10);

    const { data, error } = await this.supabase
      .getClient()
      .from('employees')
      .insert({
        tenant_code: employeeDto.tenantCode,
        employee_id: employeeDto.employeeId,
        name: employeeDto.name,
        email: employeeDto.email,
        phone: employeeDto.phone,
        password_hash: hashedPassword,
        date_of_birth: employeeDto.dateOfBirth,
        gender: employeeDto.gender,
        department: employeeDto.department,
        designation: employeeDto.designation,
        location: employeeDto.location,
        date_of_joining: employeeDto.dateOfJoining,
        status: employeeDto.status || 'active',
        grade: employeeDto.grade,
        manager_id: employeeDto.managerId,
        is_hr: employeeDto.isHr || false,
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, message: 'Employee created', data };
  }

  // Update employee
  async update(id: string, updateDto: any) {
    const updateData: any = {
      ...updateDto,
      updated_at: new Date().toISOString(),
    };

    if (updateDto.password) {
      updateData.password_hash = await bcrypt.hash(updateDto.password, 10);
      delete updateData.password;
    }

    const { data, error } = await this.supabase
      .getClient()
      .from('employees')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { success: true, message: 'Employee updated', data };
  }

  // Delete employee
  async delete(id: string) {
    // First delete dependents
    await this.supabase.getClient().from('employee_dependents').delete().eq('employee_id', id);

    const { error } = await this.supabase.getClient().from('employees').delete().eq('id', id);
    if (error) throw error;
    return { success: true, message: 'Employee deleted' };
  }

  // Bulk import employees
  async bulkImport(employees: any[], tenantCode: string) {
    const results = { success: 0, failed: 0, errors: [] };

    for (const emp of employees) {
      try {
        await this.create({ ...emp, tenantCode });
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({ employee: emp.employeeId, error: error.message });
      }
    }

    return { success: true, data: results };
  }

  // Get employee dependents
  async getDependents(employeeId: string) {
    const { data, error } = await this.supabase
      .getClient()
      .from('employee_dependents')
      .select('*')
      .eq('employee_id', employeeId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return { success: true, data: data || [] };
  }

  // Add dependent
  async addDependent(employeeId: string, dependentDto: any) {
    const { data, error } = await this.supabase
      .getClient()
      .from('employee_dependents')
      .insert({
        employee_id: employeeId,
        name: dependentDto.name,
        relationship: dependentDto.relationship,
        date_of_birth: dependentDto.dateOfBirth,
        gender: dependentDto.gender,
        is_covered: dependentDto.isCovered || true,
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, message: 'Dependent added', data };
  }

  // Update dependent
  async updateDependent(dependentId: string, updateDto: any) {
    const { data, error } = await this.supabase
      .getClient()
      .from('employee_dependents')
      .update(updateDto)
      .eq('id', dependentId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, message: 'Dependent updated', data };
  }

  // Delete dependent
  async deleteDependent(dependentId: string) {
    const { error } = await this.supabase
      .getClient()
      .from('employee_dependents')
      .delete()
      .eq('id', dependentId);

    if (error) throw error;
    return { success: true, message: 'Dependent deleted' };
  }

  // Employee login
  async login(email: string, password: string, tenantCode: string) {
    const { data: employee, error } = await this.supabase
      .getClient()
      .from('employees')
      .select('*')
      .eq('email', email)
      .eq('tenant_code', tenantCode)
      .single();

    if (error || !employee) {
      throw new Error('Invalid credentials');
    }

    const isValid = await bcrypt.compare(password, employee.password_hash);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    // Don't return password hash
    delete employee.password_hash;

    return { success: true, data: employee };
  }

  // Change password
  async changePassword(employeeId: string, currentPassword: string, newPassword: string) {
    const { data: employee, error: fetchError } = await this.supabase
      .getClient()
      .from('employees')
      .select('password_hash')
      .eq('id', employeeId)
      .single();

    if (fetchError || !employee) {
      throw new Error('Employee not found');
    }

    const isValid = await bcrypt.compare(currentPassword, employee.password_hash);
    if (!isValid) {
      throw new Error('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const { error } = await this.supabase
      .getClient()
      .from('employees')
      .update({ password_hash: hashedPassword })
      .eq('id', employeeId);

    if (error) throw error;
    return { success: true, message: 'Password changed successfully' };
  }

  // Get enrollments
  async getEnrollments(employeeId: string) {
    const { data, error } = await this.supabase
      .getClient()
      .from('employee_enrollments')
      .select('*')
      .eq('employee_id', employeeId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data: data || [] };
  }

  // Create enrollment
  async createEnrollment(enrollmentDto: any) {
    const { data, error } = await this.supabase
      .getClient()
      .from('employee_enrollments')
      .insert({
        employee_id: enrollmentDto.employeeId,
        product_type: enrollmentDto.productType,
        plan_id: enrollmentDto.planId,
        sum_insured: enrollmentDto.sumInsured,
        premium: enrollmentDto.premium,
        enrolled_dependents: enrollmentDto.enrolledDependents,
        status: 'pending',
        enrolled_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, message: 'Enrollment submitted', data };
  }

  // Get claims
  async getClaims(employeeId: string) {
    const { data, error } = await this.supabase
      .getClient()
      .from('claims')
      .select('*')
      .eq('employee_id', employeeId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data: data || [] };
  }
}
