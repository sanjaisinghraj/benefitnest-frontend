import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';

@Injectable()
export class WellnessService {
  constructor(private supabase: SupabaseService) {}

  // Get wellness programs
  async getPrograms(tenantCode?: string) {
    let query = this.supabase
      .getClient()
      .from('wellness_programs')
      .select('*')
      .order('created_at', { ascending: false });

    if (tenantCode) {
      query = query.or(`tenant_code.eq.${tenantCode},is_global.eq.true`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return { success: true, data: data || [] };
  }

  // Get single program
  async getProgram(id: string) {
    const { data, error } = await this.supabase
      .getClient()
      .from('wellness_programs')
      .select('*, wellness_activities(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return { success: true, data };
  }

  // Create program
  async createProgram(programDto: any) {
    const { data, error } = await this.supabase
      .getClient()
      .from('wellness_programs')
      .insert({
        name: programDto.name,
        description: programDto.description,
        category: programDto.category,
        start_date: programDto.startDate,
        end_date: programDto.endDate,
        points_reward: programDto.pointsReward,
        max_participants: programDto.maxParticipants,
        tenant_code: programDto.tenantCode,
        is_global: programDto.isGlobal || false,
        status: programDto.status || 'draft',
        image_url: programDto.imageUrl,
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, message: 'Program created', data };
  }

  // Update program
  async updateProgram(id: string, updateDto: any) {
    const { data, error } = await this.supabase
      .getClient()
      .from('wellness_programs')
      .update({
        ...updateDto,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { success: true, message: 'Program updated', data };
  }

  // Delete program
  async deleteProgram(id: string) {
    const { error } = await this.supabase.getClient().from('wellness_programs').delete().eq('id', id);
    if (error) throw error;
    return { success: true, message: 'Program deleted' };
  }

  // Get wellness activities
  async getActivities(programId?: string) {
    let query = this.supabase.getClient().from('wellness_activities').select('*');
    if (programId) query = query.eq('program_id', programId);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return { success: true, data: data || [] };
  }

  // Create activity
  async createActivity(activityDto: any) {
    const { data, error } = await this.supabase
      .getClient()
      .from('wellness_activities')
      .insert({
        program_id: activityDto.programId,
        name: activityDto.name,
        description: activityDto.description,
        activity_type: activityDto.activityType,
        points: activityDto.points,
        frequency: activityDto.frequency,
        target_value: activityDto.targetValue,
        unit: activityDto.unit,
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, message: 'Activity created', data };
  }

  // Log activity participation
  async logParticipation(participationDto: any) {
    const { data, error } = await this.supabase
      .getClient()
      .from('wellness_participation')
      .insert({
        employee_id: participationDto.employeeId,
        activity_id: participationDto.activityId,
        program_id: participationDto.programId,
        value: participationDto.value,
        points_earned: participationDto.pointsEarned,
        logged_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, message: 'Participation logged', data };
  }

  // Get employee wellness summary
  async getEmployeeSummary(employeeId: string) {
    const { data: participation, error: partError } = await this.supabase
      .getClient()
      .from('wellness_participation')
      .select('*, wellness_activities(*)')
      .eq('employee_id', employeeId)
      .order('logged_at', { ascending: false });

    if (partError) throw partError;

    const totalPoints = participation?.reduce((sum, p) => sum + (p.points_earned || 0), 0) || 0;

    return {
      success: true,
      data: {
        totalPoints,
        participationCount: participation?.length || 0,
        recentActivities: participation?.slice(0, 10) || [],
      },
    };
  }

  // Get wellness leaderboard
  async getLeaderboard(tenantCode: string, limit = 10) {
    const { data, error } = await this.supabase
      .getClient()
      .from('wellness_participation')
      .select('employee_id, points_earned')
      .order('points_earned', { ascending: false });

    if (error) throw error;

    // Aggregate points by employee
    const employeePoints = {};
    data?.forEach((item) => {
      employeePoints[item.employee_id] = (employeePoints[item.employee_id] || 0) + (item.points_earned || 0);
    });

    const leaderboard = Object.entries(employeePoints)
      .map(([employeeId, points]) => ({ employeeId, points }))
      .sort((a: any, b: any) => b.points - a.points)
      .slice(0, limit);

    return { success: true, data: leaderboard };
  }

  // Get wellness challenges
  async getChallenges(tenantCode?: string) {
    let query = this.supabase
      .getClient()
      .from('wellness_challenges')
      .select('*')
      .order('start_date', { ascending: false });

    if (tenantCode) {
      query = query.or(`tenant_code.eq.${tenantCode},is_global.eq.true`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return { success: true, data: data || [] };
  }

  // Create challenge
  async createChallenge(challengeDto: any) {
    const { data, error } = await this.supabase
      .getClient()
      .from('wellness_challenges')
      .insert({
        name: challengeDto.name,
        description: challengeDto.description,
        challenge_type: challengeDto.challengeType,
        start_date: challengeDto.startDate,
        end_date: challengeDto.endDate,
        goal: challengeDto.goal,
        unit: challengeDto.unit,
        points_reward: challengeDto.pointsReward,
        tenant_code: challengeDto.tenantCode,
        is_global: challengeDto.isGlobal || false,
        status: challengeDto.status || 'upcoming',
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, message: 'Challenge created', data };
  }

  // Join challenge
  async joinChallenge(challengeId: string, employeeId: string) {
    const { data, error } = await this.supabase
      .getClient()
      .from('challenge_participants')
      .insert({
        challenge_id: challengeId,
        employee_id: employeeId,
        joined_at: new Date().toISOString(),
        progress: 0,
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, message: 'Joined challenge', data };
  }

  // Update challenge progress
  async updateChallengeProgress(challengeId: string, employeeId: string, progress: number) {
    const { data, error } = await this.supabase
      .getClient()
      .from('challenge_participants')
      .update({ progress, updated_at: new Date().toISOString() })
      .eq('challenge_id', challengeId)
      .eq('employee_id', employeeId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, message: 'Progress updated', data };
  }
}
