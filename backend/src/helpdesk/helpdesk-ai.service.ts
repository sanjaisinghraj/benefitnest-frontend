import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';

interface TriageResult {
  category?: string;
  subcategory?: string;
  priority?: 'critical' | 'high' | 'medium' | 'low';
  sentiment?: 'positive' | 'neutral' | 'negative' | 'frustrated' | 'urgent';
  riskScore?: number;
  suggestedTags?: string[];
  duplicateTicketIds?: string[];
}

interface AiInsight {
  ticketId: string;
  insightType: string;
  content: any;
  confidence: number;
}

@Injectable()
export class HelpdeskAiService {
  private readonly PRIORITY_KEYWORDS = {
    critical: ['urgent', 'emergency', 'critical', 'asap', 'immediately', 'life threatening', 'hospital'],
    high: ['important', 'soon', 'deadline', 'waiting', 'frustrated', 'escalate', 'problem'],
    medium: ['help', 'issue', 'question', 'need', 'want', 'request'],
    low: ['general', 'inquiry', 'information', 'suggestion', 'feedback'],
  };

  private readonly SENTIMENT_KEYWORDS = {
    frustrated: ['frustrated', 'annoyed', 'disappointed', 'unacceptable', 'terrible', 'worst', 'useless', 'angry'],
    urgent: ['urgent', 'asap', 'emergency', 'immediately', 'critical', 'time-sensitive'],
    negative: ['not working', 'broken', 'failed', 'error', 'wrong', 'bad', 'poor', 'slow'],
    positive: ['thanks', 'appreciate', 'great', 'excellent', 'helpful', 'wonderful'],
    neutral: [],
  };

  private readonly CATEGORY_PATTERNS: Record<string, RegExp[]> = {
    claims: [
      /claim/i, /reimbursement/i, /settlement/i, /cashless/i, /pre-auth/i,
      /hospital bill/i, /medical expense/i, /discharge/i,
    ],
    enrollment: [
      /enroll/i, /add member/i, /add dependent/i, /registration/i,
      /new employee/i, /onboard/i, /sign up/i, /join/i,
    ],
    ecards: [
      /e-?card/i, /digital card/i, /download.*card/i, /card.*not.*showing/i,
      /health card/i, /insurance card/i,
    ],
    hospitals: [
      /hospital/i, /network/i, /provider/i, /doctor/i, /clinic/i,
      /find.*hospital/i, /locate/i, /empanelled/i,
    ],
    policy: [
      /policy/i, /coverage/i, /sum insured/i, /benefits/i, /premium/i,
      /plan details/i, /what.*covered/i, /limit/i,
    ],
    portal: [
      /login/i, /password/i, /account/i, /access/i, /portal/i,
      /app.*not.*working/i, /website/i, /error/i, /bug/i,
    ],
  };

  constructor(private supabase: SupabaseService) {}

  /**
   * Triage a new ticket using rule-based AI
   */
  async triageTicket(input: { title: string; description?: string; category?: string }): Promise<TriageResult> {
    const text = `${input.title} ${input.description || ''}`.toLowerCase();

    // Determine category if not provided
    const category = input.category || this.detectCategory(text);
    
    // Determine priority
    const priority = this.detectPriority(text);
    
    // Analyze sentiment
    const sentiment = this.detectSentiment(text);
    
    // Calculate risk score
    const riskScore = this.calculateRiskScore(text, priority, sentiment);
    
    // Suggest tags
    const suggestedTags = this.extractTags(text, category);

    return {
      category,
      priority,
      sentiment,
      riskScore,
      suggestedTags,
    };
  }

  /**
   * Detect category from text using pattern matching
   */
  private detectCategory(text: string): string {
    for (const [category, patterns] of Object.entries(this.CATEGORY_PATTERNS)) {
      if (patterns.some(pattern => pattern.test(text))) {
        return category;
      }
    }
    return 'general';
  }

  /**
   * Detect priority from keyword analysis
   */
  private detectPriority(text: string): 'critical' | 'high' | 'medium' | 'low' {
    for (const [priority, keywords] of Object.entries(this.PRIORITY_KEYWORDS)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        return priority as any;
      }
    }
    return 'medium';
  }

  /**
   * Detect sentiment from text
   */
  private detectSentiment(text: string): 'positive' | 'neutral' | 'negative' | 'frustrated' | 'urgent' {
    // Check frustrated first (highest priority)
    if (this.SENTIMENT_KEYWORDS.frustrated.some(k => text.includes(k))) {
      return 'frustrated';
    }
    if (this.SENTIMENT_KEYWORDS.urgent.some(k => text.includes(k))) {
      return 'urgent';
    }
    if (this.SENTIMENT_KEYWORDS.negative.some(k => text.includes(k))) {
      return 'negative';
    }
    if (this.SENTIMENT_KEYWORDS.positive.some(k => text.includes(k))) {
      return 'positive';
    }
    return 'neutral';
  }

  /**
   * Calculate risk score (0-100)
   */
  private calculateRiskScore(text: string, priority: string, sentiment: string): number {
    let score = 0;

    // Priority contributes
    const priorityScores = { critical: 40, high: 25, medium: 10, low: 0 };
    score += priorityScores[priority] || 10;

    // Sentiment contributes
    const sentimentScores = { frustrated: 30, urgent: 25, negative: 15, neutral: 0, positive: -5 };
    score += sentimentScores[sentiment] || 0;

    // Specific risk indicators
    const riskIndicators = [
      { pattern: /escalat/i, score: 15 },
      { pattern: /legal/i, score: 20 },
      { pattern: /complain/i, score: 10 },
      { pattern: /social media|twitter|linkedin/i, score: 15 },
      { pattern: /media|press/i, score: 20 },
      { pattern: /irda|ombudsman|regulator/i, score: 25 },
      { pattern: /sue|lawyer|court/i, score: 30 },
      { pattern: /refund|compensation/i, score: 10 },
    ];

    for (const indicator of riskIndicators) {
      if (indicator.pattern.test(text)) {
        score += indicator.score;
      }
    }

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Extract relevant tags from text
   */
  private extractTags(text: string, category: string): string[] {
    const tags: string[] = [category];

    const tagPatterns: Record<string, RegExp> = {
      'claims': /claim|reimbursement/i,
      'urgent': /urgent|emergency|asap/i,
      'escalated': /escalat/i,
      'cashless': /cashless/i,
      'pre-auth': /pre-?auth/i,
      'enrollment': /enroll|onboard/i,
      'ecard': /e-?card/i,
      'network-hospital': /network.*hospital|hospital.*network/i,
      'policy-coverage': /coverage|policy.*details/i,
      'portal-issue': /portal|login|password/i,
      'technical': /error|bug|not working|issue/i,
    };

    for (const [tag, pattern] of Object.entries(tagPatterns)) {
      if (pattern.test(text) && !tags.includes(tag)) {
        tags.push(tag);
      }
    }

    return tags.slice(0, 5); // Max 5 tags
  }

  /**
   * Analyze sentiment of a comment/message
   */
  async analyzeSentiment(text: string): Promise<string> {
    return this.detectSentiment(text.toLowerCase());
  }

  /**
   * Generate a summary of the ticket
   */
  async generateSummary(ticketId: string, title: string, description?: string): Promise<void> {
    // For now, create a simple extractive summary
    // In production, this would call an LLM API
    const text = `${title}. ${description || ''}`;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const summary = sentences.slice(0, 2).join('. ').trim() || title;

    // Store as AI insight
    await this.saveInsight({
      ticketId,
      insightType: 'summary',
      content: { summary },
      confidence: 0.7,
    });
  }

  /**
   * Check for duplicate tickets
   */
  async findDuplicates(tenantId: string, employeeId: string, title: string): Promise<string[]> {
    // Find recent open tickets from same employee with similar title
    const { data: recentTickets } = await this.supabase
      .getClient()
      .from('helpdesk_tickets')
      .select('id, title')
      .eq('tenant_id', tenantId)
      .eq('employee_id', employeeId)
      .in('status', ['new', 'open', 'in_progress', 'awaiting_customer'])
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Last 7 days
      .limit(10);

    if (!recentTickets?.length) return [];

    const titleWords = new Set(title.toLowerCase().split(/\s+/).filter(w => w.length > 3));
    const duplicates: string[] = [];

    for (const ticket of recentTickets) {
      const ticketWords = new Set(ticket.title.toLowerCase().split(/\s+/).filter(w => w.length > 3));
      const intersection = [...titleWords].filter(w => ticketWords.has(w));
      const similarity = intersection.length / Math.max(titleWords.size, ticketWords.size);
      
      if (similarity > 0.5) {
        duplicates.push(ticket.id);
      }
    }

    return duplicates;
  }

  /**
   * Suggest canned responses based on ticket content
   */
  async suggestResponses(ticketId: string, tenantId: string): Promise<any[]> {
    const { data: ticket } = await this.supabase
      .getClient()
      .from('helpdesk_tickets')
      .select('title, description, category, feature_key')
      .eq('id', ticketId)
      .single();

    if (!ticket) return [];

    // Get canned responses for the category/feature
    const { data: responses } = await this.supabase
      .getClient()
      .from('helpdesk_canned_responses')
      .select('*')
      .eq('is_active', true)
      .or(`tenant_id.is.null,tenant_id.eq.${tenantId}`)
      .limit(10);

    if (!responses?.length) return [];

    // Score responses by relevance
    const text = `${ticket.title} ${ticket.description || ''}`.toLowerCase();
    const scored = responses.map(response => {
      let score = 0;
      
      // Category match
      if (response.category === ticket.category) score += 30;
      if (response.feature_id && ticket.feature_key) score += 20;
      
      // Keyword match in title
      const keywords = response.keywords || [];
      for (const keyword of keywords) {
        if (text.includes(keyword.toLowerCase())) score += 10;
      }

      return { ...response, relevanceScore: score };
    });

    // Return top 3 by relevance
    return scored
      .filter(r => r.relevanceScore > 0)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 3);
  }

  /**
   * Detect if ticket needs escalation
   */
  async shouldEscalate(ticketId: string): Promise<{ shouldEscalate: boolean; reasons: string[] }> {
    const { data: ticket } = await this.supabase
      .getClient()
      .from('helpdesk_tickets')
      .select('*')
      .eq('id', ticketId)
      .single();

    if (!ticket) return { shouldEscalate: false, reasons: [] };

    const reasons: string[] = [];

    // Check SLA breach
    if (ticket.sla_breached) {
      reasons.push('SLA breached');
    }

    // Check if overdue
    if (ticket.due_at && new Date(ticket.due_at) < new Date()) {
      reasons.push('Ticket overdue');
    }

    // Check red flag score
    if (ticket.red_flag_score > 70) {
      reasons.push('High risk score');
    }

    // Check negative sentiment pattern
    if (ticket.ai_sentiment === 'frustrated' || ticket.ai_sentiment === 'urgent') {
      reasons.push('Customer sentiment requires attention');
    }

    // Check if too many reopens
    if (ticket.reopened_at) {
      reasons.push('Ticket has been reopened');
    }

    return {
      shouldEscalate: reasons.length >= 2,
      reasons,
    };
  }

  /**
   * Save AI insight to database
   */
  private async saveInsight(insight: AiInsight): Promise<void> {
    try {
      await this.supabase
        .getClient()
        .from('helpdesk_ai_insights')
        .insert({
          ticket_id: insight.ticketId,
          insight_type: insight.insightType,
          content: insight.content,
          confidence: insight.confidence,
        });
    } catch (error) {
      console.error('Failed to save AI insight:', error);
    }
  }

  /**
   * Get AI insights for a ticket
   */
  async getInsights(ticketId: string): Promise<any[]> {
    const { data } = await this.supabase
      .getClient()
      .from('helpdesk_ai_insights')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: false });

    return data || [];
  }

  /**
   * Auto-categorize based on form data
   */
  async categorizeFromFormData(formData: Record<string, any>): Promise<{ category: string; subcategory?: string }> {
    // Extract relevant fields
    const claimType = formData.claimType || formData.claim_type;
    const issueType = formData.issueType || formData.issue_type;
    const requestType = formData.requestType || formData.request_type;

    if (claimType) {
      return { category: 'claims', subcategory: claimType };
    }
    if (issueType) {
      return { category: 'portal', subcategory: issueType };
    }
    if (requestType) {
      return { category: 'general', subcategory: requestType };
    }

    return { category: 'general' };
  }

  /**
   * Predict resolution time based on historical data
   */
  async predictResolutionTime(tenantId: string, category: string, priority: string): Promise<number> {
    // Get average resolution time for similar tickets
    const { data: tickets } = await this.supabase
      .getClient()
      .from('helpdesk_tickets')
      .select('created_at, resolved_at')
      .eq('tenant_id', tenantId)
      .eq('category', category)
      .eq('priority', priority)
      .not('resolved_at', 'is', null)
      .order('created_at', { ascending: false })
      .limit(50);

    if (!tickets?.length) {
      // Return default estimates based on priority
      const defaults = { critical: 120, high: 480, medium: 1440, low: 2880 };
      return defaults[priority] || 1440;
    }

    const resolutionTimes = tickets.map(t => {
      const created = new Date(t.created_at).getTime();
      const resolved = new Date(t.resolved_at).getTime();
      return (resolved - created) / 60000; // minutes
    });

    // Return median
    resolutionTimes.sort((a, b) => a - b);
    return resolutionTimes[Math.floor(resolutionTimes.length / 2)];
  }
}
