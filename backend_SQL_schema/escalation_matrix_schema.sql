-- Escalation Matrix Schema
-- Corporate/Tenant specific escalation contacts with AI support

-- =====================================================
-- ESCALATION_CATEGORIES - Available categories
-- =====================================================
CREATE TABLE IF NOT EXISTS escalation_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(150) NOT NULL,
    icon VARCHAR(10),
    description TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default categories
INSERT INTO escalation_categories (name, display_name, icon, display_order) VALUES
    ('enrollment', 'Enrollment', '📝', 1),
    ('benefit', 'Benefits', '🎁', 2),
    ('claim', 'Claims', '📋', 3),
    ('wellness', 'Wellness', '💪', 4),
    ('marketplace', 'Marketplace', '🛒', 5),
    ('rewards', 'Rewards & Recognition', '🏆', 6),
    ('technical', 'Technical Support', '🔧', 7),
    ('event', 'Events', '📅', 8)
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- ESCALATION_MATRIX - Main escalation configuration per tenant
-- =====================================================
CREATE TABLE IF NOT EXISTS escalation_matrix (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    tenant_code VARCHAR(50) NOT NULL,
    category_id UUID NOT NULL REFERENCES escalation_categories(id),
    
    -- Level (1, 2, 3)
    level INTEGER NOT NULL CHECK (level BETWEEN 1 AND 3),
    level_name VARCHAR(100), -- e.g., "First Contact", "Supervisor", "Management"
    
    -- Contact Details
    contact_name VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(20),
    organization_name VARCHAR(255),
    designation VARCHAR(150),
    
    -- Description
    level_description TEXT, -- What queries can be raised to this level
    response_time VARCHAR(100), -- Expected response time e.g., "Within 24 hours"
    
    -- FAQ Linking
    faq_category_id UUID, -- Links to faq_categories table
    faq_link_text VARCHAR(255), -- Display text for FAQ link
    
    -- AI Configuration
    ai_enabled BOOLEAN DEFAULT TRUE,
    ai_context TEXT, -- Additional context for AI to answer queries
    ai_knowledge_base TEXT, -- Specific knowledge for this level
    
    -- Communication Options
    email_enabled BOOLEAN DEFAULT TRUE,
    call_enabled BOOLEAN DEFAULT TRUE,
    chat_enabled BOOLEAN DEFAULT TRUE,
    
    -- Metadata
    is_active BOOLEAN DEFAULT TRUE,
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(tenant_id, category_id, level)
);

CREATE INDEX IF NOT EXISTS idx_escalation_matrix_tenant ON escalation_matrix(tenant_id);
CREATE INDEX IF NOT EXISTS idx_escalation_matrix_tenant_code ON escalation_matrix(tenant_code);
CREATE INDEX IF NOT EXISTS idx_escalation_matrix_category ON escalation_matrix(category_id);

-- =====================================================
-- ESCALATION_DOCUMENTS - Uploaded documents per tenant
-- =====================================================
CREATE TABLE IF NOT EXISTS escalation_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    tenant_code VARCHAR(50) NOT NULL,
    category_id UUID REFERENCES escalation_categories(id),
    
    -- Document Details
    document_name VARCHAR(255) NOT NULL,
    document_type VARCHAR(50), -- pdf, docx, pptx
    document_url TEXT NOT NULL,
    file_size_bytes INTEGER,
    
    -- Extracted content for AI
    extracted_text TEXT,
    
    -- Metadata
    uploaded_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_escalation_documents_tenant ON escalation_documents(tenant_id);

-- =====================================================
-- ESCALATION_QUERIES - Employee queries log
-- =====================================================
CREATE TABLE IF NOT EXISTS escalation_queries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    tenant_code VARCHAR(50) NOT NULL,
    employee_id UUID,
    employee_email VARCHAR(255),
    
    -- Query Details
    category_id UUID REFERENCES escalation_categories(id),
    level INTEGER,
    query_text TEXT NOT NULL,
    
    -- AI Response
    ai_response TEXT,
    ai_confidence DECIMAL(5,2),
    ai_suggested_contact UUID REFERENCES escalation_matrix(id),
    
    -- Action Taken
    action_type VARCHAR(50), -- email, call, chat, ai_resolved
    contacted_person_id UUID REFERENCES escalation_matrix(id),
    
    -- Status
    status VARCHAR(50) DEFAULT 'open', -- open, in_progress, resolved, escalated
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolution_notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_escalation_queries_tenant ON escalation_queries(tenant_id);
CREATE INDEX IF NOT EXISTS idx_escalation_queries_employee ON escalation_queries(employee_id);
CREATE INDEX IF NOT EXISTS idx_escalation_queries_status ON escalation_queries(status);

-- =====================================================
-- ESCALATION_AI_KNOWLEDGE - Additional AI knowledge per category
-- =====================================================
CREATE TABLE IF NOT EXISTS escalation_ai_knowledge (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    tenant_code VARCHAR(50) NOT NULL,
    category_id UUID REFERENCES escalation_categories(id),
    
    -- Knowledge Entry
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    keywords TEXT[], -- For quick matching
    
    -- Metadata
    priority INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_escalation_ai_knowledge_tenant ON escalation_ai_knowledge(tenant_id);
CREATE INDEX IF NOT EXISTS idx_escalation_ai_knowledge_category ON escalation_ai_knowledge(category_id);

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE escalation_matrix IS 'Main escalation contacts per tenant, category, and level';
COMMENT ON TABLE escalation_documents IS 'Uploaded escalation matrix documents (PDF, Word, PPT)';
COMMENT ON TABLE escalation_queries IS 'Log of employee queries and AI responses';
COMMENT ON TABLE escalation_ai_knowledge IS 'Custom Q&A knowledge base per tenant for AI';
