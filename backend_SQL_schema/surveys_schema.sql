-- 1. Surveys Table
CREATE TABLE IF NOT EXISTS surveys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(tenant_id) ON DELETE CASCADE, -- Optional: if surveys are tenant-specific
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'draft', -- draft, active, closed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Questions Table
CREATE TABLE IF NOT EXISTS survey_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID REFERENCES surveys(id) ON DELETE CASCADE,
    question_type VARCHAR(50) NOT NULL, -- text, textarea, radio, checkbox, dropdown
    question_text TEXT NOT NULL,
    is_required BOOLEAN DEFAULT FALSE,
    image_url TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Question Options Table (for radio, checkbox, dropdown)
CREATE TABLE IF NOT EXISTS survey_question_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID REFERENCES survey_questions(id) ON DELETE CASCADE,
    label VARCHAR(255) NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 0
);

-- 4. Responses Table (Tracks who took the survey)
CREATE TABLE IF NOT EXISTS survey_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID REFERENCES surveys(id) ON DELETE CASCADE,
    respondent_id UUID, -- Optional: Link to employee/user if not anonymous
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Answers Table (Stores actual answers)
CREATE TABLE IF NOT EXISTS survey_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    response_id UUID REFERENCES survey_responses(id) ON DELETE CASCADE,
    question_id UUID REFERENCES survey_questions(id) ON DELETE CASCADE,
    text_value TEXT, -- For text/textarea inputs
    option_id UUID REFERENCES survey_question_options(id) ON DELETE SET NULL, -- For single select
    -- For multi-select (checkboxes), we might need a separate mapping table or just store multiple rows/array here. 
    -- A simple approach for relational: multiple rows for checkbox answers sharing same response_id & question_id
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
backend/surveys_schema.sql