-- =============================================
-- BenefitNest Survey Module Schema V2
-- =============================================

-- 1. Surveys Table (Enhanced for Branding & Templates)
ALTER TABLE surveys 
ADD COLUMN IF NOT EXISTS branding_config JSONB DEFAULT '{}', -- { primaryColor, backgroundColor, font, logoUrl, bannerUrl, ... }
ADD COLUMN IF NOT EXISTS is_template BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS template_category VARCHAR(100),
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS banner_url TEXT;

-- 2. Questions Table (Enhanced for Advanced Types)
ALTER TABLE survey_questions 
ADD COLUMN IF NOT EXISTS validation_rules JSONB DEFAULT '{}', -- { min, max, fileType, maxSize, totalWeight }
ADD COLUMN IF NOT EXISTS allow_other BOOLEAN DEFAULT FALSE, -- For MC/Checkbox
ADD COLUMN IF NOT EXISTS sub_questions JSONB DEFAULT '[]', -- For Matrix/Grid rows
ADD COLUMN IF NOT EXISTS scale_config JSONB DEFAULT '{}', -- { minLabel, maxLabel, steps }
ADD COLUMN IF NOT EXISTS weightage_config JSONB DEFAULT '{}'; -- { totalPoints }

-- 3. Question Options Table (No major changes needed, but ensure index)
CREATE INDEX IF NOT EXISTS idx_sqo_question_id ON survey_question_options(question_id);

-- 4. Answers Table (Enhanced for complex data)
ALTER TABLE survey_answers
ADD COLUMN IF NOT EXISTS numeric_value NUMERIC, -- For ratings, sliders, weightage
ADD COLUMN IF NOT EXISTS matrix_row_id VARCHAR(255), -- For matrix questions
ADD COLUMN IF NOT EXISTS other_text_value TEXT; -- For "Other" text input

-- =============================================
-- FULL FRESH SCHEMA (For Reference/New Setup)
-- =============================================
/*
CREATE TABLE surveys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'draft',
    branding_config JSONB DEFAULT '{}',
    is_template BOOLEAN DEFAULT FALSE,
    template_category VARCHAR(100),
    logo_url TEXT,
    banner_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE survey_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID REFERENCES surveys(id) ON DELETE CASCADE,
    question_type VARCHAR(50) NOT NULL,
    question_text TEXT NOT NULL,
    is_required BOOLEAN DEFAULT FALSE,
    image_url TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    validation_rules JSONB DEFAULT '{}',
    allow_other BOOLEAN DEFAULT FALSE,
    sub_questions JSONB DEFAULT '[]',
    scale_config JSONB DEFAULT '{}',
    weightage_config JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE survey_question_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID REFERENCES survey_questions(id) ON DELETE CASCADE,
    label VARCHAR(255) NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE survey_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID REFERENCES surveys(id) ON DELETE CASCADE,
    respondent_id UUID,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE survey_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    response_id UUID REFERENCES survey_responses(id) ON DELETE CASCADE,
    question_id UUID REFERENCES survey_questions(id) ON DELETE CASCADE,
    text_value TEXT,
    option_id UUID REFERENCES survey_question_options(id) ON DELETE SET NULL,
    numeric_value NUMERIC,
    matrix_row_id VARCHAR(255),
    other_text_value TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
*/
