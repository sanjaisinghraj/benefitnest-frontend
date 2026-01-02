import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../database/supabase.service';
import axios from 'axios';
import * as crypto from 'crypto';

@Injectable()
export class SurveysService {
  constructor(
    private supabase: SupabaseService,
    private configService: ConfigService,
  ) {}

  // Get categories
  async getCategories() {
    const { data, error } = await this.supabase
      .getClient()
      .from('survey_categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return { success: true, data: data || [] };
  }

  // Add category
  async addCategory(name: string, description?: string) {
    const { data, error } = await this.supabase
      .getClient()
      .from('survey_categories')
      .insert({ name, description })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new Error('Category already exists');
      }
      throw error;
    }
    return { success: true, data };
  }

  // Get tenants for dropdown
  async getTenants() {
    const { data, error } = await this.supabase
      .getClient()
      .from('tenants')
      .select('tenant_id, tenant_code, subdomain, corporate_legal_name, country, status')
      .order('corporate_legal_name', { ascending: true });

    if (error) throw error;
    return { success: true, data: data || [] };
  }

  // AI Survey Generation
  async aiGenerate(prompt: string, surveyType: string) {
    const apiKey = this.configService.get<string>('GROQ_API_KEY');

    if (!apiKey) {
      throw new Error('AI service not configured');
    }

    const systemPrompt = `You are an expert survey designer for an insurance and HR platform. 
    Generate a comprehensive survey JSON structure based on the user's request.
    Include a mix of question types: text, textarea, radio, checkbox, dropdown, rating, slider, nps, date, email, matrix, ranking, file_upload.
    
    Output format must be strictly JSON:
    {
        "title": "Survey Title",
        "description": "Professional description...",
        "questions": [
            {
                "type": "question_type",
                "text": "Question text?",
                "required": boolean,
                "options": [{"label": "Opt 1"}, ...],
                "subQuestions": [{"label": "Row 1"}, ...],
                "scaleConfig": {"min": 0, "max": 10, "minLabel": "Bad", "maxLabel": "Good"}
            }
        ]
    }`;

    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Create a "${surveyType}" survey. Details: ${prompt}` },
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' },
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      },
    );

    const generatedSurvey = JSON.parse(response.data.choices[0].message.content);

    // Add IDs
    generatedSurvey.questions = generatedSurvey.questions.map((q: any) => ({
      ...q,
      id: crypto.randomUUID(),
      options: q.options?.map((o: any) => ({ ...o, id: crypto.randomUUID() })),
      subQuestions: q.subQuestions?.map((sq: any) => ({ ...sq, id: crypto.randomUUID() })),
    }));

    return { success: true, data: generatedSurvey };
  }

  // Get all surveys
  async findAll(options: {
    tenantId?: string;
    search?: string;
    limit?: number;
    offset?: number;
    type?: string;
    status?: string;
  }) {
    const { tenantId, search, limit = 5, offset = 0, type, status } = options;

    let query = this.supabase
      .getClient()
      .from('surveys')
      .select('*, survey_questions(count)', { count: 'exact' });

    if (type === 'template') {
      query = query.eq('is_template', true);
    } else if (tenantId) {
      const tenantIds = tenantId.split(',');
      const tenantFilter = `tenant_id.in.(${tenantIds.join(',')}),is_template.eq.true`;
      query = query.or(tenantFilter);
    }

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

    const { data: surveys, error } = await query;

    if (error) throw error;

    const transformedSurveys = (surveys || []).map((survey: any) => ({
      ...survey,
      id: survey.survey_id || survey.id,
      tenantId: survey.tenant_id,
      questionCount: survey.survey_questions ? survey.survey_questions[0]?.count : 0,
      createdAt: survey.created_at ? survey.created_at.split('T')[0] : null,
      branding: survey.branding_config || {},
    }));

    return { success: true, data: transformedSurveys };
  }

  // Get single survey with questions
  async findOne(id: string) {
    const { data: survey, error } = await this.supabase
      .getClient()
      .from('surveys')
      .select(
        `*,
        questions:survey_questions(
          *,
          options:survey_question_options(*)
        )`,
      )
      .eq('survey_id', id)
      .single();

    if (error || !survey) {
      throw new Error('Survey not found');
    }

    // Sort questions and options
    if (survey.questions) {
      survey.questions.sort((a: any, b: any) => a.order_index - b.order_index);
      survey.questions.forEach((q: any) => {
        if (q.options) {
          q.options.sort((a: any, b: any) => a.order_index - b.order_index);
        }
      });
    }

    return { success: true, data: survey };
  }

  // Create survey
  async create(surveyDto: any) {
    const surveyData = {
      title: surveyDto.title,
      description: surveyDto.description,
      tenant_id: surveyDto.tenantId,
      category: surveyDto.category,
      is_template: surveyDto.isTemplate || false,
      status: surveyDto.status || 'draft',
      branding_config: surveyDto.branding || {},
      start_date: surveyDto.startDate,
      end_date: surveyDto.endDate,
      is_anonymous: surveyDto.isAnonymous || false,
      allow_multiple_submissions: surveyDto.allowMultipleSubmissions || false,
      created_by: surveyDto.createdBy,
    };

    const { data: survey, error } = await this.supabase
      .getClient()
      .from('surveys')
      .insert(surveyData)
      .select()
      .single();

    if (error) throw error;

    // Insert questions if provided
    if (surveyDto.questions && surveyDto.questions.length > 0) {
      for (let i = 0; i < surveyDto.questions.length; i++) {
        const q = surveyDto.questions[i];
        const questionData = {
          survey_id: survey.survey_id,
          type: q.type,
          text: q.text,
          required: q.required || false,
          order_index: i,
          scale_config: q.scaleConfig || null,
        };

        const { data: question, error: qError } = await this.supabase
          .getClient()
          .from('survey_questions')
          .insert(questionData)
          .select()
          .single();

        if (qError) throw qError;

        // Insert options
        if (q.options && q.options.length > 0) {
          const optionsData = q.options.map((opt: any, idx: number) => ({
            question_id: question.question_id,
            label: opt.label,
            order_index: idx,
          }));

          const { error: optError } = await this.supabase
            .getClient()
            .from('survey_question_options')
            .insert(optionsData);

          if (optError) throw optError;
        }
      }
    }

    return { success: true, message: 'Survey created', data: survey };
  }

  // Update survey
  async update(id: string, updateDto: any) {
    const updateData: any = {};

    if (updateDto.title) updateData.title = updateDto.title;
    if (updateDto.description) updateData.description = updateDto.description;
    if (updateDto.category) updateData.category = updateDto.category;
    if (updateDto.status) updateData.status = updateDto.status;
    if (updateDto.branding) updateData.branding_config = updateDto.branding;
    if (updateDto.startDate) updateData.start_date = updateDto.startDate;
    if (updateDto.endDate) updateData.end_date = updateDto.endDate;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await this.supabase
      .getClient()
      .from('surveys')
      .update(updateData)
      .eq('survey_id', id)
      .select()
      .single();

    if (error) throw error;

    return { success: true, message: 'Survey updated', data };
  }

  // Delete survey
  async delete(id: string) {
    // Delete questions and options first (cascade should handle this if set up)
    await this.supabase.getClient().from('survey_questions').delete().eq('survey_id', id);

    const { error } = await this.supabase.getClient().from('surveys').delete().eq('survey_id', id);

    if (error) throw error;

    return { success: true, message: 'Survey deleted' };
  }

  // Submit survey response
  async submitResponse(surveyId: string, responseDto: any) {
    const responseData = {
      survey_id: surveyId,
      respondent_id: responseDto.respondentId,
      respondent_email: responseDto.respondentEmail,
      answers: responseDto.answers,
      completed_at: new Date().toISOString(),
    };

    const { data, error } = await this.supabase
      .getClient()
      .from('survey_responses')
      .insert(responseData)
      .select()
      .single();

    if (error) throw error;

    return { success: true, message: 'Response submitted', data };
  }

  // Get survey responses
  async getResponses(surveyId: string) {
    const { data, error } = await this.supabase
      .getClient()
      .from('survey_responses')
      .select('*')
      .eq('survey_id', surveyId)
      .order('completed_at', { ascending: false });

    if (error) throw error;

    return { success: true, data: data || [] };
  }
}
