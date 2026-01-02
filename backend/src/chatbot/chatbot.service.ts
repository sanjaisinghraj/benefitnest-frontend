import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../database/supabase.service';
import axios from 'axios';
import * as crypto from 'crypto';

// Admin Dashboard Cards Knowledge
const ADMIN_CARDS = [
  { id: 'corporate', name: 'Corporate Management', icon: '🏢', description: 'Onboard corporates, configure subdomains, branding', keywords: ['corporate', 'onboard', 'tenant', 'subdomain', 'branding'] },
  { id: 'masters', name: 'Master Data Management', icon: '⚙️', description: 'Configure insurers, TPAs, policy types', keywords: ['master', 'insurer', 'tpa', 'policy type'] },
  { id: 'portal', name: 'Portal Customization', icon: '🎨', description: 'Design client portals with logos, colors', keywords: ['portal', 'customize', 'logo', 'color', 'theme'] },
  { id: 'employees', name: 'Employee & HR Management', icon: '👥', description: 'Bulk upload, edit employees', keywords: ['employee', 'hr', 'upload', 'bulk', 'staff'] },
  { id: 'enrollment', name: 'Enrollment Management', icon: '📝', description: 'Control enrollment windows', keywords: ['enrollment', 'enroll', 'window', 'eligibility'] },
  { id: 'surveys', name: 'Surveys & Feedback', icon: '📣', description: 'Create surveys, polls, feedback forms', keywords: ['survey', 'poll', 'feedback', 'questionnaire'] },
  { id: 'escalation', name: 'Escalation Matrix', icon: '🎯', description: 'Configure multi-level escalation contacts', keywords: ['escalation', 'escalate', 'contact', 'support'] },
  { id: 'events', name: 'Event Management', icon: '📅', description: 'Create virtual events, workshops', keywords: ['event', 'webinar', 'workshop', 'meeting'] },
  { id: 'chatbot', name: 'AI Chatbot', icon: '🤖', description: 'Manage chatbot, view conversations', keywords: ['chatbot', 'chat', 'bot', 'ai'] },
];

// System prompts for different user types
const SYSTEM_PROMPT_ADMIN = `You are a helpful AI assistant for BenefitNest admin panel. Help admins navigate the dashboard, explain field meanings, and check corporate module status. Be concise and professional.`;
const SYSTEM_PROMPT_EMPLOYEE = `You are a friendly AI assistant for BenefitNest employee portal. Help employees with benefits questions, claims, E-cards, enrollment, and wellness programs. Be helpful and empathetic.`;
const SYSTEM_PROMPT_HR = `You are an AI assistant for BenefitNest HR managers. Help with analytics, employee management, portal visits, and reporting. Provide data-driven insights.`;

@Injectable()
export class ChatbotService {
  constructor(
    private supabase: SupabaseService,
    private configService: ConfigService,
  ) {}

  private generateSessionId(): string {
    return `chat_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
  }

  private getSystemPrompt(userType: string): string {
    switch (userType) {
      case 'admin': return SYSTEM_PROMPT_ADMIN;
      case 'hr': return SYSTEM_PROMPT_HR;
      default: return SYSTEM_PROMPT_EMPLOYEE;
    }
  }

  private findRelevantCard(message: string) {
    const lowerMsg = message.toLowerCase();
    for (const card of ADMIN_CARDS) {
      for (const keyword of card.keywords) {
        if (lowerMsg.includes(keyword)) return card;
      }
    }
    return null;
  }

  // Start conversation
  async startConversation(data: {
    userType: string;
    userId?: string;
    userEmail?: string;
    userName?: string;
    tenantId?: string;
    tenantCode?: string;
    channel?: string;
  }) {
    const sessionId = this.generateSessionId();

    const { data: conversation, error } = await this.supabase
      .getClient()
      .from('chatbot_conversations')
      .insert({
        user_type: data.userType || 'employee',
        user_id: data.userId,
        user_email: data.userEmail,
        user_name: data.userName,
        tenant_id: data.tenantId,
        tenant_code: data.tenantCode,
        session_id: sessionId,
        channel: data.channel || 'web',
        status: 'active',
      })
      .select()
      .single();

    if (error) throw error;

    const welcomeMessage = data.userName
      ? `Hello ${data.userName}! 👋 I'm your BenefitNest AI Assistant. How can I help you today?`
      : `Hello! 👋 I'm your BenefitNest AI Assistant. How can I help you today?`;

    // Save welcome message
    await this.supabase.getClient().from('chatbot_messages').insert({
      conversation_id: conversation.id,
      role: 'assistant',
      content: welcomeMessage,
      source: 'system',
    });

    return {
      success: true,
      conversation: { id: conversation.id, sessionId },
      message: { content: welcomeMessage, role: 'assistant' },
    };
  }

  // Send message
  async sendMessage(data: {
    conversationId?: string;
    sessionId?: string;
    message: string;
    tenantCode?: string;
  }) {
    const startTime = Date.now();

    // Get conversation
    let conversation;
    if (data.conversationId) {
      const { data: conv } = await this.supabase
        .getClient()
        .from('chatbot_conversations')
        .select('*')
        .eq('id', data.conversationId)
        .single();
      conversation = conv;
    } else if (data.sessionId) {
      const { data: conv } = await this.supabase
        .getClient()
        .from('chatbot_conversations')
        .select('*')
        .eq('session_id', data.sessionId)
        .single();
      conversation = conv;
    }

    if (!conversation) throw new Error('Conversation not found');

    // Save user message
    await this.supabase.getClient().from('chatbot_messages').insert({
      conversation_id: conversation.id,
      role: 'user',
      content: data.message,
    });

    // Get conversation history
    const { data: history } = await this.supabase
      .getClient()
      .from('chatbot_messages')
      .select('role, content')
      .eq('conversation_id', conversation.id)
      .order('created_at', { ascending: true })
      .limit(10);

    // Prepare messages for AI
    const aiMessages = (history || [])
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .map((m) => ({ role: m.role, content: m.content }));

    // Get context for admin queries
    let cardContext = '';
    const userType = conversation.user_type || 'employee';
    if (userType === 'admin') {
      const matchedCard = this.findRelevantCard(data.message);
      if (matchedCard) {
        cardContext = `Suggested Card: ${matchedCard.name} (${matchedCard.icon}) - ${matchedCard.description}. Path: /admin/${matchedCard.id}`;
      }
    }

    // Call AI
    const aiResponse = await this.callGroqAI(aiMessages, {
      userType,
      cardContext,
    });

    const responseTimeMs = Date.now() - startTime;

    // Save AI response
    await this.supabase.getClient().from('chatbot_messages').insert({
      conversation_id: conversation.id,
      role: 'assistant',
      content: aiResponse.content,
      source: 'ai',
      response_time_ms: responseTimeMs,
      tokens_used: aiResponse.tokens,
    });

    // Build response
    const response: any = {
      success: true,
      message: {
        role: 'assistant',
        content: aiResponse.content,
      },
      meta: {
        responseTimeMs,
        tokensUsed: aiResponse.tokens,
      },
    };

    // Add card suggestion for admins
    if (userType === 'admin' && cardContext) {
      const matchedCard = this.findRelevantCard(data.message);
      if (matchedCard) {
        response.suggestedCard = {
          id: matchedCard.id,
          name: matchedCard.name,
          icon: matchedCard.icon,
          path: `/admin/${matchedCard.id}`,
        };
      }
    }

    return response;
  }

  private async callGroqAI(
    messages: { role: string; content: string }[],
    options: { userType?: string; cardContext?: string },
  ) {
    const apiKey = this.configService.get<string>('GROQ_API_KEY');

    if (!apiKey) {
      return {
        content: "I apologize, but I'm having trouble connecting. Please try again later.",
        tokens: 0,
      };
    }

    let systemMessage = this.getSystemPrompt(options.userType || 'employee');
    if (options.cardContext) {
      systemMessage += `\n\n${options.cardContext}`;
    }

    try {
      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'system', content: systemMessage }, ...messages],
          max_tokens: 600,
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return {
        content: response.data.choices[0].message.content,
        tokens: response.data.usage?.total_tokens || 0,
      };
    } catch (err) {
      console.error('Groq AI error:', err);
      return {
        content: "I apologize, but I'm having trouble processing your request. Would you like to speak with a human?",
        tokens: 0,
      };
    }
  }

  // End conversation
  async endConversation(conversationId: string, rating?: number) {
    const updateData: any = {
      status: 'completed',
      ended_at: new Date().toISOString(),
    };
    if (rating) updateData.rating = rating;

    const { error } = await this.supabase
      .getClient()
      .from('chatbot_conversations')
      .update(updateData)
      .eq('id', conversationId);

    if (error) throw error;

    return { success: true, message: 'Conversation ended' };
  }

  // Get conversation history
  async getConversation(id: string) {
    const { data: conversation, error: convError } = await this.supabase
      .getClient()
      .from('chatbot_conversations')
      .select('*')
      .eq('id', id)
      .single();

    if (convError) throw convError;

    const { data: messages } = await this.supabase
      .getClient()
      .from('chatbot_messages')
      .select('*')
      .eq('conversation_id', id)
      .order('created_at', { ascending: true });

    return { success: true, conversation, messages: messages || [] };
  }

  // Get analytics (admin)
  async getAnalytics(tenantCode?: string) {
    let query = this.supabase
      .getClient()
      .from('chatbot_conversations')
      .select('*', { count: 'exact' });

    if (tenantCode) {
      query = query.eq('tenant_code', tenantCode);
    }

    const { count: total } = await query;

    const { count: active } = await this.supabase
      .getClient()
      .from('chatbot_conversations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    const { count: escalated } = await this.supabase
      .getClient()
      .from('chatbot_conversations')
      .select('*', { count: 'exact', head: true })
      .eq('escalated', true);

    const { data: ratingData } = await this.supabase
      .getClient()
      .from('chatbot_conversations')
      .select('rating')
      .not('rating', 'is', null);

    const avgRating =
      ratingData && ratingData.length > 0
        ? ratingData.reduce((sum, r) => sum + r.rating, 0) / ratingData.length
        : 0;

    return {
      success: true,
      analytics: {
        total: total || 0,
        active: active || 0,
        escalated: escalated || 0,
        avgRating: Math.round(avgRating * 10) / 10,
      },
    };
  }

  // Get all conversations (admin)
  async getAllConversations(options: { limit?: number; offset?: number; status?: string }) {
    const { limit = 20, offset = 0, status } = options;

    let query = this.supabase
      .getClient()
      .from('chatbot_conversations')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    return { success: true, data: data || [], total: count };
  }
}
