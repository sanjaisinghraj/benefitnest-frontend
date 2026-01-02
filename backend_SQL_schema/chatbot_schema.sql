-- =====================================================
-- CHATBOT MODULE SCHEMA
-- AI-powered support chatbot for BenefitNest
-- =====================================================

-- =====================================================
-- CHATBOT_CONVERSATIONS - Main conversation sessions
-- =====================================================
CREATE TABLE IF NOT EXISTS chatbot_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- User context
    user_type VARCHAR(20) NOT NULL, -- 'employee', 'admin', 'hr', 'anonymous'
    user_id UUID, -- employee_id or admin_id
    user_email VARCHAR(255),
    user_name VARCHAR(255),
    tenant_id UUID,
    tenant_code VARCHAR(50),
    
    -- Session info
    session_id VARCHAR(100) UNIQUE,
    channel VARCHAR(50) DEFAULT 'web', -- 'web', 'mobile', 'whatsapp', 'email'
    
    -- Conversation metadata
    title VARCHAR(255), -- Auto-generated summary
    category VARCHAR(50), -- 'benefits', 'claims', 'enrollment', 'wellness', 'technical', 'general'
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'resolved', 'escalated', 'closed'
    
    -- Escalation tracking
    escalated BOOLEAN DEFAULT FALSE,
    escalated_at TIMESTAMP WITH TIME ZONE,
    escalated_to VARCHAR(255), -- contact email
    escalation_level INTEGER,
    escalation_category VARCHAR(50),
    
    -- Feedback
    user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
    user_feedback TEXT,
    
    -- Stats
    message_count INTEGER DEFAULT 0,
    ai_response_count INTEGER DEFAULT 0,
    avg_response_time_ms INTEGER,
    
    -- Timestamps
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_chatbot_conversations_user ON chatbot_conversations(user_id);
CREATE INDEX idx_chatbot_conversations_tenant ON chatbot_conversations(tenant_id);
CREATE INDEX idx_chatbot_conversations_status ON chatbot_conversations(status);
CREATE INDEX idx_chatbot_conversations_session ON chatbot_conversations(session_id);
CREATE INDEX idx_chatbot_conversations_category ON chatbot_conversations(category);

-- =====================================================
-- CHATBOT_MESSAGES - Individual messages in conversations
-- =====================================================
CREATE TABLE IF NOT EXISTS chatbot_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES chatbot_conversations(id) ON DELETE CASCADE,
    
    -- Message content
    role VARCHAR(20) NOT NULL, -- 'user', 'assistant', 'system'
    content TEXT NOT NULL,
    content_type VARCHAR(20) DEFAULT 'text', -- 'text', 'image', 'file', 'card', 'quick_reply'
    
    -- Rich content (for cards, buttons, etc.)
    metadata JSONB, -- {buttons: [], cards: [], attachments: []}
    
    -- AI context
    intent VARCHAR(100), -- Detected intent
    confidence DECIMAL(5,4), -- Intent confidence score
    entities JSONB, -- Extracted entities {claim_id: '', policy_type: ''}
    
    -- Source tracking
    source VARCHAR(50), -- 'ai', 'faq', 'knowledge_base', 'escalation', 'system'
    source_reference VARCHAR(255), -- FAQ ID or document reference
    
    -- Response metrics
    response_time_ms INTEGER,
    tokens_used INTEGER,
    
    -- Feedback on this specific message
    helpful BOOLEAN,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_chatbot_messages_conversation ON chatbot_messages(conversation_id);
CREATE INDEX idx_chatbot_messages_role ON chatbot_messages(role);
CREATE INDEX idx_chatbot_messages_created ON chatbot_messages(created_at);

-- =====================================================
-- CHATBOT_KNOWLEDGE_BASE - Custom knowledge for the bot
-- =====================================================
CREATE TABLE IF NOT EXISTS chatbot_knowledge_base (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Scope
    tenant_id UUID, -- NULL for global knowledge
    tenant_code VARCHAR(50),
    is_global BOOLEAN DEFAULT FALSE,
    
    -- Content
    category VARCHAR(50) NOT NULL, -- 'benefits', 'claims', 'enrollment', 'wellness', 'policy', 'general'
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    keywords TEXT[], -- For search matching
    
    -- Q&A format (optional)
    question TEXT,
    answer TEXT,
    
    -- Metadata
    priority INTEGER DEFAULT 50, -- Higher = more important
    source VARCHAR(100), -- 'manual', 'faq_import', 'document', 'policy'
    source_url TEXT,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Stats
    times_used INTEGER DEFAULT 0,
    helpful_count INTEGER DEFAULT 0,
    not_helpful_count INTEGER DEFAULT 0,
    
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_chatbot_kb_tenant ON chatbot_knowledge_base(tenant_id);
CREATE INDEX idx_chatbot_kb_category ON chatbot_knowledge_base(category);
CREATE INDEX idx_chatbot_kb_global ON chatbot_knowledge_base(is_global);
CREATE INDEX idx_chatbot_kb_keywords ON chatbot_knowledge_base USING GIN(keywords);

-- =====================================================
-- CHATBOT_QUICK_REPLIES - Pre-defined quick reply options
-- =====================================================
CREATE TABLE IF NOT EXISTS chatbot_quick_replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    tenant_id UUID, -- NULL for global
    is_global BOOLEAN DEFAULT TRUE,
    
    category VARCHAR(50) NOT NULL,
    trigger_keywords TEXT[],
    
    -- Quick reply content
    display_text VARCHAR(255) NOT NULL,
    response_text TEXT NOT NULL,
    
    -- Actions
    action_type VARCHAR(50), -- 'link', 'escalate', 'claim_status', 'enrollment'
    action_data JSONB,
    
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_chatbot_qr_tenant ON chatbot_quick_replies(tenant_id);
CREATE INDEX idx_chatbot_qr_category ON chatbot_quick_replies(category);

-- =====================================================
-- CHATBOT_ESCALATION_LOG - Track escalations to humans
-- =====================================================
CREATE TABLE IF NOT EXISTS chatbot_escalation_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES chatbot_conversations(id) ON DELETE CASCADE,
    
    -- Escalation details
    escalation_reason TEXT,
    escalation_category VARCHAR(50),
    escalation_level INTEGER DEFAULT 1,
    
    -- Contact details (from escalation_matrix)
    contact_name VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    
    -- Method used
    method VARCHAR(20), -- 'email', 'whatsapp', 'call', 'ticket'
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'sent', 'acknowledged', 'resolved'
    
    -- Tracking
    notification_sent_at TIMESTAMP WITH TIME ZONE,
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolution_notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_chatbot_escalation_conversation ON chatbot_escalation_log(conversation_id);
CREATE INDEX idx_chatbot_escalation_status ON chatbot_escalation_log(status);

-- =====================================================
-- CHATBOT_ANALYTICS - Aggregated analytics
-- =====================================================
CREATE TABLE IF NOT EXISTS chatbot_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    date DATE NOT NULL,
    tenant_id UUID,
    
    -- Counts
    total_conversations INTEGER DEFAULT 0,
    total_messages INTEGER DEFAULT 0,
    unique_users INTEGER DEFAULT 0,
    
    -- By category
    benefits_queries INTEGER DEFAULT 0,
    claims_queries INTEGER DEFAULT 0,
    enrollment_queries INTEGER DEFAULT 0,
    wellness_queries INTEGER DEFAULT 0,
    technical_queries INTEGER DEFAULT 0,
    other_queries INTEGER DEFAULT 0,
    
    -- Resolution
    resolved_by_ai INTEGER DEFAULT 0,
    escalated_to_human INTEGER DEFAULT 0,
    
    -- Satisfaction
    avg_rating DECIMAL(3,2),
    positive_feedback INTEGER DEFAULT 0,
    negative_feedback INTEGER DEFAULT 0,
    
    -- Performance
    avg_response_time_ms INTEGER,
    avg_messages_per_conversation DECIMAL(5,2),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(date, tenant_id)
);

CREATE INDEX idx_chatbot_analytics_date ON chatbot_analytics(date);
CREATE INDEX idx_chatbot_analytics_tenant ON chatbot_analytics(tenant_id);

-- =====================================================
-- INSERT DEFAULT QUICK REPLIES
-- =====================================================
INSERT INTO chatbot_quick_replies (is_global, category, display_text, response_text, action_type, display_order) VALUES
(TRUE, 'welcome', '👋 Benefits Info', 'I can help you understand your employee benefits including health insurance, life insurance, and wellness programs. What would you like to know?', NULL, 1),
(TRUE, 'welcome', '📋 Check Claim Status', 'I can help you check the status of your claims. Please provide your claim ID or I can show you all your recent claims.', 'claim_status', 2),
(TRUE, 'welcome', '📝 Enrollment Help', 'I can guide you through the enrollment process for benefits. Are you looking to enroll in a new plan or modify an existing one?', NULL, 3),
(TRUE, 'welcome', '💪 Wellness Programs', 'Explore our wellness programs including fitness challenges, mental health resources, and preventive care benefits!', NULL, 4),
(TRUE, 'welcome', '🎯 Talk to Human', 'I''ll connect you with a support representative. Please tell me briefly what you need help with.', 'escalate', 5),
(TRUE, 'claims', '📊 View All Claims', 'Here are your recent claims. Click on any claim to see details.', 'view_claims', 1),
(TRUE, 'claims', '➕ File New Claim', 'I''ll guide you through filing a new claim. What type of claim is this?', 'new_claim', 2),
(TRUE, 'claims', '❓ Claim Query', 'Have a question about a specific claim? Please share the claim ID.', NULL, 3),
(TRUE, 'benefits', '🏥 Health Insurance', 'Your health insurance covers hospitalization, OPD, and preventive care. Want to see your coverage details?', NULL, 1),
(TRUE, 'benefits', '💰 Sum Insured', 'I can show you your sum insured details for all your policies.', NULL, 2),
(TRUE, 'benefits', '👨‍👩‍👧‍👦 Family Coverage', 'View or modify your family members covered under your policies.', NULL, 3)
ON CONFLICT DO NOTHING;

-- =====================================================
-- INSERT DEFAULT KNOWLEDGE BASE ENTRIES
-- =====================================================
INSERT INTO chatbot_knowledge_base (is_global, category, title, content, question, answer, keywords, priority) VALUES
(TRUE, 'claims', 'How to File a Claim', 'To file a claim, go to the Claims section in your portal, click "New Claim", fill in the required details, upload supporting documents, and submit.', 'How do I file a claim?', 'To file a claim: 1) Go to Claims section 2) Click "New Claim" 3) Select claim type 4) Fill in details 5) Upload documents 6) Submit. You''ll receive a claim ID for tracking.', ARRAY['file', 'claim', 'submit', 'new claim', 'how to claim'], 100),
(TRUE, 'claims', 'Claim Processing Time', 'Most claims are processed within 7-10 working days. Complex claims may take up to 15 days.', 'How long does claim processing take?', 'Standard claims are processed in 7-10 working days. Complex claims requiring additional verification may take up to 15 working days. You can track status anytime in the portal.', ARRAY['processing time', 'how long', 'claim time', 'days', 'duration'], 90),
(TRUE, 'benefits', 'Health Insurance Coverage', 'Your health insurance covers hospitalization, day care procedures, pre and post hospitalization expenses, and preventive health checkups.', 'What does my health insurance cover?', 'Your health insurance covers: Hospitalization expenses, Day care procedures, Pre-hospitalization (30 days), Post-hospitalization (60 days), Preventive health checkups, Ambulance charges, and more based on your plan.', ARRAY['coverage', 'health insurance', 'covered', 'what is covered', 'benefits'], 100),
(TRUE, 'enrollment', 'Enrollment Window', 'You can enroll or modify your benefits during the annual enrollment window or within 30 days of a qualifying life event.', 'When can I enroll?', 'You can enroll during: 1) Annual enrollment window (announced by HR) 2) Within 30 days of joining 3) Within 30 days of a life event (marriage, birth of child, etc.)', ARRAY['enroll', 'enrollment', 'when', 'window', 'deadline'], 95),
(TRUE, 'wellness', 'Wellness Programs Available', 'We offer fitness challenges, mental health support, preventive care benefits, and wellness rewards.', 'What wellness programs are available?', 'Available wellness programs: 🏃 Fitness Challenges, 🧘 Mental Health Support, 🏥 Preventive Health Checkups, 🎁 Wellness Rewards, 📱 Health Tracking Apps integration', ARRAY['wellness', 'programs', 'fitness', 'mental health', 'preventive'], 85)
ON CONFLICT DO NOTHING;

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE chatbot_conversations IS 'Stores chat conversation sessions with users';
COMMENT ON TABLE chatbot_messages IS 'Individual messages within conversations';
COMMENT ON TABLE chatbot_knowledge_base IS 'Knowledge base entries for AI to reference';
COMMENT ON TABLE chatbot_quick_replies IS 'Pre-defined quick reply buttons and responses';
COMMENT ON TABLE chatbot_escalation_log IS 'Tracks when conversations are escalated to humans';
COMMENT ON TABLE chatbot_analytics IS 'Daily aggregated analytics for chatbot performance';
