-- ============================================================================
-- HELPDESK MODULE - DATABASE SCHEMA
-- Multi-tenant helpdesk system with SLAs, AI triage, and escalations
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For text search

-- ============================================================================
-- 1. FEATURE CATALOG (Dynamic Forms)
-- ============================================================================
CREATE TABLE IF NOT EXISTS helpdesk_features (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(tenant_id) ON DELETE CASCADE,  -- NULL = global feature
    key VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(50) DEFAULT '📋',
    form_schema JSONB DEFAULT '[]'::jsonb,  -- Dynamic form fields
    categories JSONB DEFAULT '[]'::jsonb,   -- [{name, subcategories: []}]
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, key)
);

-- ============================================================================
-- 2. SLA POLICIES
-- ============================================================================
CREATE TABLE IF NOT EXISTS helpdesk_sla_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(tenant_id) ON DELETE CASCADE,  -- NULL = global default
    feature_id UUID REFERENCES helpdesk_features(id) ON DELETE CASCADE,  -- NULL = all features
    name VARCHAR(255) NOT NULL,
    priority VARCHAR(20) NOT NULL CHECK (priority IN ('critical', 'high', 'medium', 'low')),
    first_response_minutes INTEGER NOT NULL DEFAULT 60,
    resolution_target_minutes INTEGER NOT NULL DEFAULT 480,
    working_hours JSONB DEFAULT '{"start": "09:00", "end": "18:00", "timezone": "Asia/Kolkata", "workDays": [1,2,3,4,5]}'::jsonb,
    pause_on_statuses TEXT[] DEFAULT ARRAY['awaiting_customer'],
    escalation_enabled BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 3. HELPDESK TICKETS
-- ============================================================================
CREATE TABLE IF NOT EXISTS helpdesk_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_number VARCHAR(20) NOT NULL UNIQUE,  -- e.g., TKT-2024-000001
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employees(id),
    employee_email VARCHAR(255),
    employee_name VARCHAR(255),
    feature_id UUID REFERENCES helpdesk_features(id),
    feature_key VARCHAR(100),
    
    -- Ticket content
    title VARCHAR(500) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    subcategory VARCHAR(100),
    form_data JSONB DEFAULT '{}'::jsonb,  -- Dynamic form responses
    
    -- Classification
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
    status VARCHAR(30) DEFAULT 'new' CHECK (status IN (
        'new', 'triaged', 'in_progress', 'awaiting_customer', 
        'escalated', 'resolved', 'closed', 'reopened'
    )),
    channel VARCHAR(30) DEFAULT 'web' CHECK (channel IN ('web', 'email', 'mobile', 'phone', 'api')),
    
    -- Assignment
    current_assignee_id UUID,
    assignee_name VARCHAR(255),
    assigned_team VARCHAR(100),
    
    -- SLA tracking
    sla_policy_id UUID REFERENCES helpdesk_sla_policies(id),
    due_at TIMESTAMPTZ,
    first_response_at TIMESTAMPTZ,
    first_response_due_at TIMESTAMPTZ,
    sla_breached BOOLEAN DEFAULT false,
    sla_paused_at TIMESTAMPTZ,
    sla_pause_duration_minutes INTEGER DEFAULT 0,
    
    -- AI insights
    ai_category_suggestion VARCHAR(100),
    ai_priority_suggestion VARCHAR(20),
    ai_sentiment VARCHAR(20),  -- positive, neutral, negative
    ai_risk_score DECIMAL(3,2) DEFAULT 0,  -- 0.00 to 1.00
    ai_summary TEXT,
    red_flag_score INTEGER DEFAULT 0,  -- 0-100
    duplicate_of_ticket_id UUID REFERENCES helpdesk_tickets(id),
    
    -- Metadata
    tags TEXT[] DEFAULT '{}',
    custom_fields JSONB DEFAULT '{}'::jsonb,
    attachments_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    internal_notes_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    first_replied_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ,
    reopened_at TIMESTAMPTZ,
    last_activity_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for ticket queries
CREATE INDEX idx_tickets_tenant_status ON helpdesk_tickets(tenant_id, status);
CREATE INDEX idx_tickets_tenant_priority ON helpdesk_tickets(tenant_id, priority);
CREATE INDEX idx_tickets_tenant_assignee ON helpdesk_tickets(tenant_id, current_assignee_id);
CREATE INDEX idx_tickets_tenant_due_at ON helpdesk_tickets(tenant_id, due_at);
CREATE INDEX idx_tickets_employee ON helpdesk_tickets(employee_id);
CREATE INDEX idx_tickets_feature ON helpdesk_tickets(feature_id);
CREATE INDEX idx_tickets_created ON helpdesk_tickets(created_at DESC);
CREATE INDEX idx_tickets_red_flag ON helpdesk_tickets(tenant_id, red_flag_score DESC) WHERE red_flag_score > 0;
CREATE INDEX idx_tickets_search ON helpdesk_tickets USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- ============================================================================
-- 4. TICKET COMMENTS (Thread)
-- ============================================================================
CREATE TABLE IF NOT EXISTS helpdesk_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES helpdesk_tickets(id) ON DELETE CASCADE,
    author_id UUID,  -- Can be employee or admin
    author_email VARCHAR(255),
    author_name VARCHAR(255),
    author_role VARCHAR(50),  -- employee, agent, manager, admin, system
    
    body TEXT NOT NULL,
    body_html TEXT,
    is_internal_note BOOLEAN DEFAULT false,
    is_auto_reply BOOLEAN DEFAULT false,
    
    attachments JSONB DEFAULT '[]'::jsonb,  -- [{id, filename, url, mimeType, size}]
    mentions JSONB DEFAULT '[]'::jsonb,  -- [{userId, name}]
    
    sentiment VARCHAR(20),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_comments_ticket ON helpdesk_comments(ticket_id, created_at);
CREATE INDEX idx_comments_internal ON helpdesk_comments(ticket_id, is_internal_note);

-- ============================================================================
-- 5. TICKET EVENTS (Audit Trail)
-- ============================================================================
CREATE TABLE IF NOT EXISTS helpdesk_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES helpdesk_tickets(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,  -- status_change, assignment, priority_change, escalation, sla_breach, merge, tag_change, reopen
    
    actor_id UUID,
    actor_email VARCHAR(255),
    actor_name VARCHAR(255),
    actor_role VARCHAR(50),
    
    old_value JSONB,
    new_value JSONB,
    metadata JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_events_ticket ON helpdesk_events(ticket_id, created_at DESC);
CREATE INDEX idx_events_type ON helpdesk_events(event_type);

-- ============================================================================
-- 6. ATTACHMENTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS helpdesk_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES helpdesk_tickets(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES helpdesk_comments(id) ON DELETE SET NULL,
    
    uploader_id UUID,
    uploader_email VARCHAR(255),
    
    filename VARCHAR(500) NOT NULL,
    original_filename VARCHAR(500),
    storage_path VARCHAR(1000),
    url VARCHAR(2000),
    mime_type VARCHAR(100),
    size_bytes BIGINT,
    
    is_image BOOLEAN DEFAULT false,
    thumbnail_url VARCHAR(2000),
    virus_scanned BOOLEAN DEFAULT false,
    virus_scan_result VARCHAR(50),
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_attachments_ticket ON helpdesk_attachments(ticket_id);

-- ============================================================================
-- 7. ESCALATION RULES
-- ============================================================================
CREATE TABLE IF NOT EXISTS helpdesk_escalation_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    feature_id UUID REFERENCES helpdesk_features(id) ON DELETE CASCADE,
    
    name VARCHAR(255) NOT NULL,
    description TEXT,
    priority INTEGER DEFAULT 0,  -- Higher = runs first
    is_active BOOLEAN DEFAULT true,
    
    -- Conditions (all must match)
    conditions JSONB NOT NULL DEFAULT '[]'::jsonb,
    -- [
    --   {"field": "priority", "operator": "eq", "value": "critical"},
    --   {"field": "sla_breached", "operator": "eq", "value": true},
    --   {"field": "inactivity_minutes", "operator": "gt", "value": 60}
    -- ]
    
    -- Actions to take
    actions JSONB NOT NULL DEFAULT '[]'::jsonb,
    -- [
    --   {"type": "notify", "targets": ["manager"], "template": "escalation_alert"},
    --   {"type": "reassign", "to": "role:manager"},
    --   {"type": "set_red_flag", "score": 80}
    -- ]
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 8. QUEUE ASSIGNMENTS (Routing Rules)
-- ============================================================================
CREATE TABLE IF NOT EXISTS helpdesk_queue_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    feature_id UUID REFERENCES helpdesk_features(id) ON DELETE CASCADE,
    category VARCHAR(100),
    
    -- Assignment target
    assignee_user_id UUID,
    assignee_email VARCHAR(255),
    assignee_name VARCHAR(255),
    team_name VARCHAR(100),
    
    -- Round-robin settings
    use_round_robin BOOLEAN DEFAULT false,
    last_assigned_at TIMESTAMPTZ,
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_queue_tenant_feature ON helpdesk_queue_assignments(tenant_id, feature_id);

-- ============================================================================
-- 9. TAGS
-- ============================================================================
CREATE TABLE IF NOT EXISTS helpdesk_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7) DEFAULT '#6b7280',
    tag_type VARCHAR(20) DEFAULT 'user' CHECK (tag_type IN ('system', 'user', 'ai')),
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, name)
);

-- ============================================================================
-- 10. TICKET TAGS (Many-to-Many)
-- ============================================================================
CREATE TABLE IF NOT EXISTS helpdesk_ticket_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES helpdesk_tickets(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES helpdesk_tags(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(ticket_id, tag_id)
);

-- ============================================================================
-- 11. CANNED RESPONSES / MACROS
-- ============================================================================
CREATE TABLE IF NOT EXISTS helpdesk_canned_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    feature_id UUID REFERENCES helpdesk_features(id) ON DELETE CASCADE,
    category VARCHAR(100),
    
    name VARCHAR(255) NOT NULL,
    shortcut VARCHAR(50),  -- e.g., /thanks
    body TEXT NOT NULL,
    body_html TEXT,
    
    variables JSONB DEFAULT '[]'::jsonb,  -- [{key, description}]
    
    visibility VARCHAR(20) DEFAULT 'team' CHECK (visibility IN ('personal', 'team', 'global')),
    owner_id UUID,
    usage_count INTEGER DEFAULT 0,
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 12. AI INSIGHTS LOG
-- ============================================================================
CREATE TABLE IF NOT EXISTS helpdesk_ai_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES helpdesk_tickets(id) ON DELETE CASCADE,
    
    model_name VARCHAR(100),
    model_version VARCHAR(50),
    
    insight_type VARCHAR(50),  -- triage, sentiment, summary, duplicate, response_suggestion
    
    input_hash VARCHAR(64),  -- For caching
    
    -- Results
    category_suggestion VARCHAR(100),
    subcategory_suggestion VARCHAR(100),
    priority_suggestion VARCHAR(20),
    intent VARCHAR(100),
    sentiment VARCHAR(20),
    sentiment_score DECIMAL(3,2),
    risk_score DECIMAL(3,2),
    summary TEXT,
    duplicate_candidates JSONB DEFAULT '[]'::jsonb,  -- [{ticketId, score}]
    response_suggestion TEXT,
    
    confidence DECIMAL(3,2),
    tokens_used INTEGER,
    latency_ms INTEGER,
    
    feedback_rating INTEGER,  -- 1-5, for ML feedback loop
    feedback_text TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_insights_ticket ON helpdesk_ai_insights(ticket_id, created_at DESC);

-- ============================================================================
-- 13. NOTIFICATIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS helpdesk_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID REFERENCES helpdesk_tickets(id) ON DELETE CASCADE,
    
    recipient_id UUID,
    recipient_email VARCHAR(255),
    recipient_name VARCHAR(255),
    
    channel VARCHAR(20) NOT NULL CHECK (channel IN ('email', 'sms', 'in_app', 'push', 'webhook')),
    template_key VARCHAR(100),
    
    subject VARCHAR(500),
    body TEXT,
    payload JSONB DEFAULT '{}'::jsonb,
    
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'bounced')),
    sent_at TIMESTAMPTZ,
    error_message TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_recipient ON helpdesk_notifications(recipient_id, created_at DESC);
CREATE INDEX idx_notifications_status ON helpdesk_notifications(status, created_at);

-- ============================================================================
-- 14. HELPDESK AUDIT LOGS
-- ============================================================================
CREATE TABLE IF NOT EXISTS helpdesk_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    
    actor_id UUID,
    actor_email VARCHAR(255),
    actor_name VARCHAR(255),
    actor_role VARCHAR(50),
    actor_ip VARCHAR(45),
    
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    
    old_value JSONB,
    new_value JSONB,
    diff JSONB,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_tenant_date ON helpdesk_audit_logs(tenant_id, created_at DESC);
CREATE INDEX idx_audit_entity ON helpdesk_audit_logs(entity_type, entity_id);

-- ============================================================================
-- 15. ANALYTICS MATERIALIZED VIEWS (For Performance)
-- ============================================================================

-- Daily ticket stats per tenant
CREATE MATERIALIZED VIEW IF NOT EXISTS helpdesk_daily_stats AS
SELECT 
    tenant_id,
    DATE_TRUNC('day', created_at) as stat_date,
    COUNT(*) as tickets_created,
    COUNT(*) FILTER (WHERE status = 'resolved') as tickets_resolved,
    COUNT(*) FILTER (WHERE status = 'closed') as tickets_closed,
    COUNT(*) FILTER (WHERE sla_breached = true) as sla_breaches,
    AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))/60) FILTER (WHERE resolved_at IS NOT NULL) as avg_resolution_minutes,
    COUNT(*) FILTER (WHERE priority = 'critical') as critical_count,
    COUNT(*) FILTER (WHERE priority = 'high') as high_count,
    COUNT(*) FILTER (WHERE red_flag_score > 50) as red_flag_count
FROM helpdesk_tickets
GROUP BY tenant_id, DATE_TRUNC('day', created_at);

CREATE UNIQUE INDEX idx_daily_stats ON helpdesk_daily_stats(tenant_id, stat_date);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Generate ticket number
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TRIGGER AS $$
DECLARE
    year_part TEXT;
    seq_number INTEGER;
BEGIN
    year_part := TO_CHAR(NOW(), 'YYYY');
    
    SELECT COALESCE(MAX(
        CAST(SPLIT_PART(ticket_number, '-', 3) AS INTEGER)
    ), 0) + 1 INTO seq_number
    FROM helpdesk_tickets
    WHERE ticket_number LIKE 'TKT-' || year_part || '-%';
    
    NEW.ticket_number := 'TKT-' || year_part || '-' || LPAD(seq_number::TEXT, 6, '0');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_ticket_number
    BEFORE INSERT ON helpdesk_tickets
    FOR EACH ROW
    WHEN (NEW.ticket_number IS NULL)
    EXECUTE FUNCTION generate_ticket_number();

-- Update ticket last_activity_at on comment
CREATE OR REPLACE FUNCTION update_ticket_activity()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE helpdesk_tickets 
    SET 
        last_activity_at = NOW(),
        comments_count = comments_count + CASE WHEN NOT NEW.is_internal_note THEN 1 ELSE 0 END,
        internal_notes_count = internal_notes_count + CASE WHEN NEW.is_internal_note THEN 1 ELSE 0 END
    WHERE id = NEW.ticket_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_ticket_activity
    AFTER INSERT ON helpdesk_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_ticket_activity();

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_helpdesk_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_tickets_timestamp
    BEFORE UPDATE ON helpdesk_tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_helpdesk_timestamp();

CREATE TRIGGER trigger_update_comments_timestamp
    BEFORE UPDATE ON helpdesk_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_helpdesk_timestamp();

-- ============================================================================
-- SEED DATA: Default Features
-- ============================================================================
INSERT INTO helpdesk_features (tenant_id, key, name, description, icon, categories, form_schema, sort_order)
VALUES 
    (NULL, 'claims', 'Claims Support', 'Get help with claim submissions, status, and reimbursements', '🏥', 
     '[{"name": "Claim Status", "subcategories": ["Pending", "Rejected", "Partial Payment"]}, {"name": "New Claim", "subcategories": ["Hospitalization", "OPD", "Dental", "Vision"]}, {"name": "Documents", "subcategories": ["Missing", "Incorrect", "Upload Issue"]}]',
     '[{"key": "claimId", "label": "Claim ID (if any)", "type": "text", "required": false}, {"key": "claimType", "label": "Claim Type", "type": "select", "options": ["Hospitalization", "OPD", "Dental", "Vision", "Other"], "required": true}]',
     1),
    
    (NULL, 'enrollment', 'Enrollment Help', 'Assistance with benefit enrollment and plan selection', '📝',
     '[{"name": "New Enrollment", "subcategories": ["Plan Selection", "Family Addition", "Documents"]}, {"name": "Changes", "subcategories": ["Plan Change", "Coverage Update", "Dependent Update"]}, {"name": "Issues", "subcategories": ["System Error", "Eligibility", "Deadline Extension"]}]',
     '[{"key": "enrollmentType", "label": "Enrollment Type", "type": "select", "options": ["New Joiner", "Annual Enrollment", "Life Event", "Correction"], "required": true}]',
     2),
    
    (NULL, 'ecards', 'E-Card Issues', 'Problems with digital insurance cards', '💳',
     '[{"name": "Download", "subcategories": ["Not Loading", "Wrong Details", "Expired"]}, {"name": "Update", "subcategories": ["Name Change", "Add Dependent", "Remove Member"]}]',
     '[]',
     3),
    
    (NULL, 'hospitals', 'Hospital Network', 'Questions about network hospitals and cashless facilities', '🏥',
     '[{"name": "Network", "subcategories": ["Find Hospital", "Cashless Process", "Empanelment"]}, {"name": "Issues", "subcategories": ["Denied Cashless", "Hospital Not Listed", "Wrong Information"]}]',
     '[{"key": "hospitalName", "label": "Hospital Name", "type": "text", "required": false}, {"key": "city", "label": "City", "type": "text", "required": false}]',
     4),
    
    (NULL, 'policy', 'Policy & Coverage', 'Questions about your insurance coverage and benefits', '📋',
     '[{"name": "Coverage", "subcategories": ["Whats Covered", "Limits", "Waiting Period"]}, {"name": "Documents", "subcategories": ["Policy Copy", "Certificate", "ID Card"]}]',
     '[]',
     5),
    
    (NULL, 'portal', 'Portal Issues', 'Technical issues with the benefits portal', '💻',
     '[{"name": "Login", "subcategories": ["Forgot Password", "Account Locked", "SSO Issue"]}, {"name": "Technical", "subcategories": ["Page Not Loading", "Error Message", "Mobile App"]}, {"name": "Data", "subcategories": ["Wrong Information", "Missing Data", "Update Request"]}]',
     '[{"key": "browser", "label": "Browser Used", "type": "select", "options": ["Chrome", "Firefox", "Safari", "Edge", "Mobile App", "Other"], "required": false}, {"key": "errorMessage", "label": "Error Message (if any)", "type": "textarea", "required": false}]',
     6),
    
    (NULL, 'general', 'General Inquiry', 'Other questions and feedback', '💬',
     '[{"name": "Question", "subcategories": []}, {"name": "Feedback", "subcategories": ["Positive", "Improvement Suggestion", "Complaint"]}, {"name": "Other", "subcategories": []}]',
     '[]',
     99)
ON CONFLICT (tenant_id, key) DO NOTHING;

-- Default SLA Policies
INSERT INTO helpdesk_sla_policies (tenant_id, feature_id, name, priority, first_response_minutes, resolution_target_minutes)
VALUES
    (NULL, NULL, 'Critical Default', 'critical', 15, 120),
    (NULL, NULL, 'High Default', 'high', 60, 480),
    (NULL, NULL, 'Medium Default', 'medium', 240, 1440),
    (NULL, NULL, 'Low Default', 'low', 480, 2880)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- GRANTS (Adjust as needed for your setup)
-- ============================================================================
-- GRANT ALL ON ALL TABLES IN SCHEMA public TO your_app_role;
-- GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO your_app_role;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO your_app_role;

COMMENT ON TABLE helpdesk_tickets IS 'Main helpdesk ticket table with multi-tenant support';
COMMENT ON TABLE helpdesk_comments IS 'Threaded comments on tickets with internal notes support';
COMMENT ON TABLE helpdesk_sla_policies IS 'SLA/TAT policies per tenant, feature, and priority';
COMMENT ON TABLE helpdesk_escalation_rules IS 'Auto-escalation rules based on conditions';
