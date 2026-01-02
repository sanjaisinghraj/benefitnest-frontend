-- =====================================================
-- EMAIL TEMPLATE MANAGER SCHEMA
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Base Templates Table (System-wide templates)
CREATE TABLE IF NOT EXISTS base_templates (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN (
        'enrollment', 'wellness', 'survey', 'benefits', 'claims', 'renewal', 'general'
    )),
    description TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Corporate Templates Table (Customized templates per corporate)
CREATE TABLE IF NOT EXISTS corporate_templates (
    id VARCHAR(100) PRIMARY KEY,
    base_template_id VARCHAR(100) NOT NULL REFERENCES base_templates(id) ON DELETE CASCADE,
    corporate_id VARCHAR(100) NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(base_template_id, corporate_id)
);

-- Email Logs Table (For tracking sent emails)
CREATE TABLE IF NOT EXISTS email_logs (
    id SERIAL PRIMARY KEY,
    template_id VARCHAR(100),
    template_type VARCHAR(20) DEFAULT 'base',
    corporate_id VARCHAR(100),
    recipient_email VARCHAR(255) NOT NULL,
    subject VARCHAR(500),
    status VARCHAR(20) DEFAULT 'pending',
    error_message TEXT,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_base_templates_event_type ON base_templates(event_type);
CREATE INDEX IF NOT EXISTS idx_corporate_templates_corporate_id ON corporate_templates(corporate_id);
CREATE INDEX IF NOT EXISTS idx_corporate_templates_base_template_id ON corporate_templates(base_template_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_template_id ON email_logs(template_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_corporate_id ON email_logs(corporate_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON email_logs(created_at);

-- =====================================================
-- SEED DATA - Default Base Templates
-- =====================================================

INSERT INTO base_templates (id, name, subject, content, event_type, description) VALUES
-- Enrollment Templates
('base_enrollment_welcome', 'Welcome to Benefits Portal', 'Welcome to {{corporate_name}} Benefits Portal', 
'<h1>Welcome, {{employee_name}}!</h1>
<p>We are excited to welcome you to the {{corporate_name}} Benefits Portal.</p>
<p>You can now access all your benefits information, enroll in plans, and manage your coverage.</p>
<p><a href="{{portal_url}}">Click here to access your portal</a></p>
<p>If you have any questions, please contact HR.</p>
<p>Best regards,<br>{{corporate_name}} HR Team</p>', 
'enrollment', 'Welcome email sent to new employees when they are added to the portal'),

('base_enrollment_confirmation', 'Enrollment Confirmation', 'Your Benefits Enrollment is Confirmed', 
'<h1>Enrollment Confirmed</h1>
<p>Dear {{employee_name}},</p>
<p>Your benefits enrollment has been successfully processed.</p>
<h2>Enrollment Details:</h2>
<ul>
<li>Plan: {{plan_name}}</li>
<li>Coverage: {{coverage_type}}</li>
<li>Effective Date: {{effective_date}}</li>
</ul>
<p>You will receive your benefits card within 7-10 business days.</p>
<p>Best regards,<br>{{corporate_name}} Benefits Team</p>', 
'enrollment', 'Confirmation email sent after successful benefits enrollment'),

-- Wellness Templates
('base_wellness_activity', 'New Wellness Activity Available', 'New Wellness Activity: {{activity_name}}', 
'<h1>New Wellness Activity</h1>
<p>Hi {{employee_name}},</p>
<p>A new wellness activity is available for you:</p>
<h2>{{activity_name}}</h2>
<p>{{activity_description}}</p>
<p>Rewards: {{reward_points}} points</p>
<p><a href="{{activity_url}}">Participate Now</a></p>
<p>Stay healthy!<br>{{corporate_name}} Wellness Team</p>', 
'wellness', 'Notification for new wellness activities'),

('base_wellness_reminder', 'Wellness Goal Reminder', 'Don''t Forget Your Wellness Goals!', 
'<h1>Wellness Reminder</h1>
<p>Hi {{employee_name}},</p>
<p>Just a friendly reminder about your wellness goals:</p>
<p>Current Progress: {{progress_percentage}}%</p>
<p>Keep up the great work!</p>
<p><a href="{{portal_url}}">View Your Progress</a></p>
<p>Best,<br>{{corporate_name}} Wellness Team</p>', 
'wellness', 'Reminder email for wellness goals'),

-- Survey Templates
('base_survey_invitation', 'Survey Invitation', 'We Value Your Feedback - {{survey_title}}', 
'<h1>Share Your Feedback</h1>
<p>Dear {{employee_name}},</p>
<p>We would love to hear your thoughts! Please take a few minutes to complete our survey:</p>
<h2>{{survey_title}}</h2>
<p>{{survey_description}}</p>
<p><a href="{{survey_url}}">Take the Survey</a></p>
<p>Your feedback helps us improve!</p>
<p>Thank you,<br>{{corporate_name}}</p>', 
'survey', 'Invitation email for surveys'),

('base_survey_reminder', 'Survey Reminder', 'Reminder: Complete Your Survey', 
'<h1>Survey Reminder</h1>
<p>Hi {{employee_name}},</p>
<p>You haven''t completed the survey yet:</p>
<h2>{{survey_title}}</h2>
<p>The survey closes on {{deadline_date}}.</p>
<p><a href="{{survey_url}}">Complete Survey Now</a></p>
<p>Thank you,<br>{{corporate_name}}</p>', 
'survey', 'Reminder email for pending surveys'),

-- Claims Templates
('base_claims_submitted', 'Claim Submitted', 'Your Claim Has Been Submitted - #{{claim_id}}', 
'<h1>Claim Submitted</h1>
<p>Dear {{employee_name}},</p>
<p>Your claim has been submitted successfully.</p>
<h2>Claim Details:</h2>
<ul>
<li>Claim ID: {{claim_id}}</li>
<li>Type: {{claim_type}}</li>
<li>Amount: {{claim_amount}}</li>
<li>Submitted: {{submission_date}}</li>
</ul>
<p>You can track your claim status in the portal.</p>
<p>Best regards,<br>{{corporate_name}} Claims Team</p>', 
'claims', 'Confirmation email when claim is submitted'),

('base_claims_approved', 'Claim Approved', 'Good News! Your Claim Has Been Approved', 
'<h1>Claim Approved</h1>
<p>Dear {{employee_name}},</p>
<p>Great news! Your claim has been approved.</p>
<h2>Claim Details:</h2>
<ul>
<li>Claim ID: {{claim_id}}</li>
<li>Approved Amount: {{approved_amount}}</li>
<li>Payment Date: {{payment_date}}</li>
</ul>
<p>The amount will be credited to your account.</p>
<p>Best regards,<br>{{corporate_name}} Claims Team</p>', 
'claims', 'Notification email when claim is approved'),

-- Benefits Templates
('base_benefits_update', 'Benefits Update', 'Important Update to Your Benefits', 
'<h1>Benefits Update</h1>
<p>Dear {{employee_name}},</p>
<p>There has been an update to your benefits:</p>
<p>{{update_details}}</p>
<p><a href="{{portal_url}}">View Details</a></p>
<p>If you have questions, please contact HR.</p>
<p>Best regards,<br>{{corporate_name}} HR Team</p>', 
'benefits', 'General benefits update notification'),

-- Renewal Templates
('base_renewal_reminder', 'Benefits Renewal Reminder', 'Time to Renew Your Benefits', 
'<h1>Benefits Renewal</h1>
<p>Dear {{employee_name}},</p>
<p>The open enrollment period is approaching!</p>
<p>Enrollment Period: {{start_date}} - {{end_date}}</p>
<p>Please review and renew your benefits selections.</p>
<p><a href="{{portal_url}}">Review Benefits</a></p>
<p>Best regards,<br>{{corporate_name}} HR Team</p>', 
'renewal', 'Reminder email for benefits renewal period'),

-- General Templates
('base_general_announcement', 'Announcement', '{{announcement_title}}', 
'<h1>{{announcement_title}}</h1>
<p>Dear {{employee_name}},</p>
<p>{{announcement_content}}</p>
<p>Best regards,<br>{{corporate_name}}</p>', 
'general', 'General announcement template')

ON CONFLICT (id) DO NOTHING;

-- Enable RLS (Row Level Security) if needed
-- ALTER TABLE base_templates ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE corporate_templates ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
