-- Event Management Schema
-- All tables prefixed with event_ for consistency

-- =====================================================
-- EVENT_MASTER - Main event details
-- =====================================================
CREATE TABLE IF NOT EXISTS event_master (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(100) NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    banner_url TEXT,
    mailer_subject VARCHAR(500),
    mailer_content TEXT,
    mailer_html TEXT,
    
    -- Video Conference
    platform VARCHAR(50) DEFAULT 'jitsi',
    meeting_link TEXT,
    meeting_id VARCHAR(255),
    meeting_password VARCHAR(100),
    
    -- Schedule
    event_date DATE NOT NULL,
    event_time TIME NOT NULL,
    event_datetime TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER DEFAULT 60,
    timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
    
    -- Status
    status VARCHAR(20) DEFAULT 'draft', -- draft, scheduled, live, completed, cancelled
    registration_open BOOLEAN DEFAULT TRUE,
    max_participants INTEGER,
    
    -- Metadata
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    published_at TIMESTAMP WITH TIME ZONE,
    
    -- Stats (denormalized for performance)
    total_invited INTEGER DEFAULT 0,
    total_registered INTEGER DEFAULT 0,
    total_attended INTEGER DEFAULT 0
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_event_master_status ON event_master(status);
CREATE INDEX IF NOT EXISTS idx_event_master_event_date ON event_master(event_date);
CREATE INDEX IF NOT EXISTS idx_event_master_event_type ON event_master(event_type);

-- =====================================================
-- EVENT_TENANTS - Which tenants/corporates are invited
-- =====================================================
CREATE TABLE IF NOT EXISTS event_tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES event_master(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL,
    tenant_code VARCHAR(50) NOT NULL,
    corporate_name VARCHAR(255),
    
    -- Status tracking
    invitation_sent BOOLEAN DEFAULT FALSE,
    invitation_sent_at TIMESTAMP WITH TIME ZONE,
    
    -- Aggregate stats for this tenant
    employees_invited INTEGER DEFAULT 0,
    employees_registered INTEGER DEFAULT 0,
    employees_attended INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(event_id, tenant_id)
);

CREATE INDEX IF NOT EXISTS idx_event_tenants_event_id ON event_tenants(event_id);
CREATE INDEX IF NOT EXISTS idx_event_tenants_tenant_id ON event_tenants(tenant_id);

-- =====================================================
-- EVENT_PARTICIPANTS - Individual participant records
-- =====================================================
CREATE TABLE IF NOT EXISTS event_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES event_master(id) ON DELETE CASCADE,
    tenant_id UUID,
    tenant_code VARCHAR(50),
    
    -- Participant details
    employee_id UUID,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    designation VARCHAR(100),
    department VARCHAR(100),
    
    -- Status: invited, registered, confirmed, attended, no_show
    status VARCHAR(20) DEFAULT 'invited',
    
    -- Tracking
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    registered_at TIMESTAMP WITH TIME ZONE,
    confirmed_at TIMESTAMP WITH TIME ZONE,
    attended_at TIMESTAMP WITH TIME ZONE,
    
    -- Join tracking
    join_time TIMESTAMP WITH TIME ZONE,
    leave_time TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    
    -- Communication
    invitation_email_sent BOOLEAN DEFAULT FALSE,
    confirmation_email_sent BOOLEAN DEFAULT FALSE,
    reminder_email_sent BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(event_id, email)
);

CREATE INDEX IF NOT EXISTS idx_event_participants_event_id ON event_participants(event_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_tenant_id ON event_participants(tenant_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_status ON event_participants(status);
CREATE INDEX IF NOT EXISTS idx_event_participants_email ON event_participants(email);

-- =====================================================
-- EVENT_REGISTRATIONS - Registration form submissions
-- =====================================================
CREATE TABLE IF NOT EXISTS event_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES event_master(id) ON DELETE CASCADE,
    participant_id UUID REFERENCES event_participants(id) ON DELETE CASCADE,
    
    -- Registration details
    registration_token VARCHAR(100) UNIQUE,
    registration_source VARCHAR(50), -- email_link, portal, admin_added
    
    -- Form data (flexible JSON for custom fields)
    form_data JSONB,
    
    -- Confirmation
    confirmed BOOLEAN DEFAULT FALSE,
    confirmation_token VARCHAR(100),
    confirmed_at TIMESTAMP WITH TIME ZONE,
    
    -- Calendar
    calendar_added BOOLEAN DEFAULT FALSE,
    calendar_type VARCHAR(20), -- google, outlook, ical
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_token ON event_registrations(registration_token);

-- =====================================================
-- EVENT_EMAILS - Email log for tracking
-- =====================================================
CREATE TABLE IF NOT EXISTS event_emails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES event_master(id) ON DELETE CASCADE,
    participant_id UUID REFERENCES event_participants(id) ON DELETE CASCADE,
    
    email_type VARCHAR(50) NOT NULL, -- invitation, confirmation, reminder, follow_up
    recipient_email VARCHAR(255) NOT NULL,
    subject VARCHAR(500),
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending', -- pending, sent, delivered, opened, clicked, bounced, failed
    
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    opened_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    
    error_message TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_emails_event_id ON event_emails(event_id);
CREATE INDEX IF NOT EXISTS idx_event_emails_status ON event_emails(status);

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE event_master IS 'Main event table storing event details, schedule, and platform configuration';
COMMENT ON TABLE event_tenants IS 'Tracks which corporates/tenants are invited to each event';
COMMENT ON TABLE event_participants IS 'Individual participants with their registration and attendance status';
COMMENT ON TABLE event_registrations IS 'Registration form submissions and confirmation tracking';
COMMENT ON TABLE event_emails IS 'Email communication log for tracking delivery and engagement';
