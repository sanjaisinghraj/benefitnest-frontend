import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';

@Injectable()
export class ClaimsAnalyticsService {
  constructor(private supabase: SupabaseService) {}

  // Get claims overview
  async getOverview(tenantCode?: string, startDate?: string, endDate?: string) {
    let query = this.supabase.getClient().from('claims').select('*');

    if (tenantCode) query = query.eq('tenant_code', tenantCode);
    if (startDate) query = query.gte('created_at', startDate);
    if (endDate) query = query.lte('created_at', endDate);

    const { data, error } = await query;
    if (error) throw error;

    const claims = data || [];

    const overview = {
      totalClaims: claims.length,
      totalAmount: claims.reduce((sum, c) => sum + (c.amount || 0), 0),
      approvedAmount: claims
        .filter((c) => c.status === 'approved')
        .reduce((sum, c) => sum + (c.approved_amount || 0), 0),
      pendingClaims: claims.filter((c) => c.status === 'pending').length,
      approvedClaims: claims.filter((c) => c.status === 'approved').length,
      rejectedClaims: claims.filter((c) => c.status === 'rejected').length,
      averageClaimAmount: claims.length > 0 
        ? claims.reduce((sum, c) => sum + (c.amount || 0), 0) / claims.length 
        : 0,
      averageProcessingTime: this.calculateAverageProcessingTime(claims),
    };

    return { success: true, data: overview };
  }

  // Calculate average processing time in days
  private calculateAverageProcessingTime(claims: any[]): number {
    const processedClaims = claims.filter(
      (c) => (c.status === 'approved' || c.status === 'rejected') && c.processed_at
    );

    if (processedClaims.length === 0) return 0;

    const totalDays = processedClaims.reduce((sum, c) => {
      const created = new Date(c.created_at).getTime();
      const processed = new Date(c.processed_at).getTime();
      return sum + (processed - created) / (1000 * 60 * 60 * 24);
    }, 0);

    return Math.round(totalDays / processedClaims.length);
  }

  // Get claims by status
  async getByStatus(tenantCode?: string) {
    let query = this.supabase.getClient().from('claims').select('status');
    if (tenantCode) query = query.eq('tenant_code', tenantCode);

    const { data, error } = await query;
    if (error) throw error;

    const statusCounts = {};
    (data || []).forEach((c) => {
      statusCounts[c.status] = (statusCounts[c.status] || 0) + 1;
    });

    return { success: true, data: statusCounts };
  }

  // Get claims by type
  async getByType(tenantCode?: string) {
    let query = this.supabase.getClient().from('claims').select('claim_type, amount');
    if (tenantCode) query = query.eq('tenant_code', tenantCode);

    const { data, error } = await query;
    if (error) throw error;

    const typeStats = {};
    (data || []).forEach((c) => {
      if (!typeStats[c.claim_type]) {
        typeStats[c.claim_type] = { count: 0, amount: 0 };
      }
      typeStats[c.claim_type].count++;
      typeStats[c.claim_type].amount += c.amount || 0;
    });

    return { success: true, data: typeStats };
  }

  // Get claims trend (monthly)
  async getTrend(tenantCode?: string, months = 12) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    let query = this.supabase
      .getClient()
      .from('claims')
      .select('created_at, amount, status')
      .gte('created_at', startDate.toISOString());

    if (tenantCode) query = query.eq('tenant_code', tenantCode);

    const { data, error } = await query;
    if (error) throw error;

    const monthlyData = {};
    (data || []).forEach((c) => {
      const month = new Date(c.created_at).toISOString().slice(0, 7); // YYYY-MM
      if (!monthlyData[month]) {
        monthlyData[month] = { count: 0, amount: 0, approved: 0, rejected: 0 };
      }
      monthlyData[month].count++;
      monthlyData[month].amount += c.amount || 0;
      if (c.status === 'approved') monthlyData[month].approved++;
      if (c.status === 'rejected') monthlyData[month].rejected++;
    });

    const trend = Object.entries(monthlyData)
      .map(([month, stats]) => ({ month, ...stats as any }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return { success: true, data: trend };
  }

  // Get top claim categories
  async getTopCategories(tenantCode?: string, limit = 10) {
    let query = this.supabase.getClient().from('claims').select('category, amount');
    if (tenantCode) query = query.eq('tenant_code', tenantCode);

    const { data, error } = await query;
    if (error) throw error;

    const categoryStats = {};
    (data || []).forEach((c) => {
      const category = c.category || 'Uncategorized';
      if (!categoryStats[category]) {
        categoryStats[category] = { count: 0, amount: 0 };
      }
      categoryStats[category].count++;
      categoryStats[category].amount += c.amount || 0;
    });

    const topCategories = Object.entries(categoryStats)
      .map(([category, stats]) => ({ category, ...stats as any }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, limit);

    return { success: true, data: topCategories };
  }

  // Get claims by department
  async getByDepartment(tenantCode?: string) {
    let query = this.supabase.getClient().from('claims').select('department, amount, status');
    if (tenantCode) query = query.eq('tenant_code', tenantCode);

    const { data, error } = await query;
    if (error) throw error;

    const deptStats = {};
    (data || []).forEach((c) => {
      const dept = c.department || 'Unknown';
      if (!deptStats[dept]) {
        deptStats[dept] = { count: 0, amount: 0, approved: 0, rejected: 0 };
      }
      deptStats[dept].count++;
      deptStats[dept].amount += c.amount || 0;
      if (c.status === 'approved') deptStats[dept].approved++;
      if (c.status === 'rejected') deptStats[dept].rejected++;
    });

    return { success: true, data: deptStats };
  }

  // Get claims aging report
  async getAgingReport(tenantCode?: string) {
    let query = this.supabase
      .getClient()
      .from('claims')
      .select('created_at, amount')
      .eq('status', 'pending');

    if (tenantCode) query = query.eq('tenant_code', tenantCode);

    const { data, error } = await query;
    if (error) throw error;

    const now = new Date().getTime();
    const aging = {
      '0-7 days': { count: 0, amount: 0 },
      '8-14 days': { count: 0, amount: 0 },
      '15-30 days': { count: 0, amount: 0 },
      '31-60 days': { count: 0, amount: 0 },
      '60+ days': { count: 0, amount: 0 },
    };

    (data || []).forEach((c) => {
      const days = Math.floor((now - new Date(c.created_at).getTime()) / (1000 * 60 * 60 * 24));
      let bucket: string;
      if (days <= 7) bucket = '0-7 days';
      else if (days <= 14) bucket = '8-14 days';
      else if (days <= 30) bucket = '15-30 days';
      else if (days <= 60) bucket = '31-60 days';
      else bucket = '60+ days';

      aging[bucket].count++;
      aging[bucket].amount += c.amount || 0;
    });

    return { success: true, data: aging };
  }

  // Get settlement ratio
  async getSettlementRatio(tenantCode?: string) {
    let query = this.supabase
      .getClient()
      .from('claims')
      .select('amount, approved_amount, status')
      .eq('status', 'approved');

    if (tenantCode) query = query.eq('tenant_code', tenantCode);

    const { data, error } = await query;
    if (error) throw error;

    const totalClaimed = (data || []).reduce((sum, c) => sum + (c.amount || 0), 0);
    const totalApproved = (data || []).reduce((sum, c) => sum + (c.approved_amount || 0), 0);

    return {
      success: true,
      data: {
        totalClaimed,
        totalApproved,
        settlementRatio: totalClaimed > 0 ? Math.round((totalApproved / totalClaimed) * 100) : 0,
      },
    };
  }
}
