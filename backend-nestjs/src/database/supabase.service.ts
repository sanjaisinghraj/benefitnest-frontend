import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('SUPABASE_URL and SUPABASE_KEY must be defined');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase client initialized');
  }

  getClient(): SupabaseClient {
    return this.supabase;
  }

  // Helper methods for common operations
  async findAll(table: string, options?: {
    select?: string;
    filters?: Record<string, any>;
    orderBy?: { column: string; ascending?: boolean };
    limit?: number;
    offset?: number;
  }) {
    let query = this.supabase.from(table).select(options?.select || '*', { count: 'exact' });

    if (options?.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          query = query.eq(key, value);
        }
      });
    }

    if (options?.orderBy) {
      query = query.order(options.orderBy.column, { ascending: options.orderBy.ascending ?? false });
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    return query;
  }

  async findOne(table: string, id: string, idColumn = 'id') {
    return this.supabase.from(table).select('*').eq(idColumn, id).single();
  }

  async findByField(table: string, field: string, value: any) {
    return this.supabase.from(table).select('*').eq(field, value);
  }

  async create(table: string, data: any) {
    return this.supabase.from(table).insert(data).select().single();
  }

  async createMany(table: string, data: any[]) {
    return this.supabase.from(table).insert(data).select();
  }

  async update(table: string, id: string, data: any, idColumn = 'id') {
    return this.supabase.from(table).update(data).eq(idColumn, id).select().single();
  }

  async delete(table: string, id: string, idColumn = 'id') {
    return this.supabase.from(table).delete().eq(idColumn, id);
  }

  async search(table: string, column: string, searchTerm: string) {
    return this.supabase.from(table).select('*').ilike(column, `%${searchTerm}%`);
  }
}
