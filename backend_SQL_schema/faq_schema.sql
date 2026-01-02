-- =====================================================
-- FAQ Management Schema for PostgreSQL (Supabase)
-- =====================================================
-- Run this SQL in your Supabase SQL Editor or psql

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. Master FAQs Table
-- =====================================================
CREATE TABLE IF NOT EXISTS master_faqs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    country VARCHAR(100) NOT NULL DEFAULT 'Global',
    category VARCHAR(100) NOT NULL,
    policy_type_code VARCHAR(100),
    policy_type_name VARCHAR(255),
    display_order INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_master_faqs_country ON master_faqs(country);
CREATE INDEX IF NOT EXISTS idx_master_faqs_category ON master_faqs(category);
CREATE INDEX IF NOT EXISTS idx_master_faqs_policy_type ON master_faqs(policy_type_code);
CREATE INDEX IF NOT EXISTS idx_master_faqs_is_active ON master_faqs(is_active);
CREATE INDEX IF NOT EXISTS idx_master_faqs_display_order ON master_faqs(display_order);

-- Add comments
COMMENT ON TABLE master_faqs IS 'Master table for all FAQs, filterable by country, category, and policy type';
COMMENT ON COLUMN master_faqs.country IS 'Country code (India, USA, UK, UAE, Singapore, Global, etc.)';
COMMENT ON COLUMN master_faqs.category IS 'Category (Health, Life, Accident, Retirement, Wellness, Corporate, etc.)';
COMMENT ON COLUMN master_faqs.policy_type_code IS 'References policy_type.code (e.g., GROUP_HEALTH_IND, GTL, GPA)';

-- =====================================================
-- 2. FAQ Tenant Mappings Table
-- =====================================================
CREATE TABLE IF NOT EXISTS faq_tenant_mappings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    faq_id UUID NOT NULL REFERENCES master_faqs(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    is_global BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_faq_tenant UNIQUE(faq_id, tenant_id)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_faq_mappings_faq_id ON faq_tenant_mappings(faq_id);
CREATE INDEX IF NOT EXISTS idx_faq_mappings_tenant_id ON faq_tenant_mappings(tenant_id);
CREATE INDEX IF NOT EXISTS idx_faq_mappings_is_global ON faq_tenant_mappings(is_global);

-- Add comments
COMMENT ON TABLE faq_tenant_mappings IS 'Maps FAQs to specific tenants or marks them as global (available to all tenants)';
COMMENT ON COLUMN faq_tenant_mappings.tenant_id IS 'NULL if is_global=true (applies to all tenants)';
COMMENT ON COLUMN faq_tenant_mappings.is_global IS 'If true, this FAQ is visible to all tenants';

-- =====================================================
-- 3. Updated_at Trigger Function
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to master_faqs
DROP TRIGGER IF EXISTS update_master_faqs_updated_at ON master_faqs;
CREATE TRIGGER update_master_faqs_updated_at
    BEFORE UPDATE ON master_faqs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to faq_tenant_mappings
DROP TRIGGER IF EXISTS update_faq_mappings_updated_at ON faq_tenant_mappings;
CREATE TRIGGER update_faq_mappings_updated_at
    BEFORE UPDATE ON faq_tenant_mappings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 4. Row Level Security (RLS) Policies
-- =====================================================
ALTER TABLE master_faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq_tenant_mappings ENABLE ROW LEVEL SECURITY;

-- Policy for admin access (full access)
CREATE POLICY admin_all_faqs ON master_faqs
    FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY admin_all_faq_mappings ON faq_tenant_mappings
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- =====================================================
-- 5. Insert Pre-defined FAQs (Seed Data)
-- =====================================================
INSERT INTO master_faqs (question, answer, country, category, policy_type_code, policy_type_name, display_order, is_active)
VALUES
-- Health - India
('What is Group Health Insurance?', 
 'Group Health Insurance (GMC) is a type of health insurance that covers a group of people, typically employees of a company. It provides medical coverage including hospitalization, day care procedures, and pre/post hospitalization expenses.', 
 'India', 'Health', 'GROUP_HEALTH_IND', 'Group Health / Medical Insurance', 1, true),

('Who is covered under Group Health Insurance?', 
 'Typically, the employee and their dependents (spouse, children, and sometimes parents) are covered. The exact coverage depends on the policy terms chosen by the employer.', 
 'India', 'Health', 'GROUP_HEALTH_IND', 'Group Health / Medical Insurance', 2, true),

('What is the waiting period for pre-existing diseases?', 
 'For group policies, there is usually no waiting period for pre-existing diseases. Coverage starts from day one of policy inception. However, this may vary based on the policy terms.', 
 'India', 'Health', 'GROUP_HEALTH_IND', 'Group Health / Medical Insurance', 3, true),

('How do I file a cashless claim?', 
 'Visit a network hospital, show your e-card at the TPA desk, fill the pre-authorization form, and the hospital will coordinate with the insurer for approval. For planned hospitalization, initiate the process 3-4 days in advance.', 
 'India', 'Health', 'GROUP_HEALTH_IND', 'Group Health / Medical Insurance', 4, true),

('What documents are needed for reimbursement claims?', 
 'You need: Original hospital bills and receipts, discharge summary, investigation reports, prescription copies, pharmacy bills, claim form signed by employee, cancelled cheque or bank details.', 
 'India', 'Health', 'GROUP_HEALTH_IND', 'Group Health / Medical Insurance', 5, true),

-- Health - USA
('What is employer-sponsored health insurance?', 
 'Employer-sponsored health insurance is a health policy that an employer purchases and offers to eligible employees and their dependents. The employer typically pays a portion of the premium.', 
 'USA', 'Health', 'GROUP_HEALTH_USA', 'Group Health / Medical Insurance', 1, true),

('What is COBRA coverage?', 
 'COBRA (Consolidated Omnibus Budget Reconciliation Act) allows employees to continue their group health coverage for a limited time after leaving employment, though they must pay the full premium.', 
 'USA', 'Health', 'GROUP_HEALTH_USA', 'Group Health / Medical Insurance', 2, true),

('What is the difference between HMO and PPO plans?', 
 'HMO (Health Maintenance Organization) requires you to use in-network providers and get referrals for specialists. PPO (Preferred Provider Organization) offers more flexibility to see any doctor but at higher costs for out-of-network care.', 
 'USA', 'Health', 'GROUP_HEALTH_USA', 'Group Health / Medical Insurance', 3, true),

-- Health - UAE Dubai
('Is health insurance mandatory in Dubai?', 
 'Yes, health insurance is mandatory for all employees in Dubai. Employers must provide health insurance coverage to their employees as per Dubai Health Authority (DHA) regulations.', 
 'UAE', 'Health', 'GROUP_HEALTH_UAE_DXB', 'Group Health / Medical Insurance', 1, true),

('What is the minimum coverage required in Dubai?', 
 'The Essential Benefits Plan (EBP) is the minimum mandatory coverage, which includes AED 150,000 annual limit for inpatient, outpatient consultations, diagnostics, and prescribed treatments.', 
 'UAE', 'Health', 'GROUP_HEALTH_UAE_DXB', 'Group Health / Medical Insurance', 2, true),

-- Life - India
('What is Group Term Life Insurance?', 
 'Group Term Life Insurance (GTL) provides life coverage to employees. In case of death during employment, the nominee receives a lump sum benefit, typically a multiple of annual salary.', 
 'India', 'Life', 'GROUP_TERM_LIFE_IND', 'Group Term Life Insurance', 1, true),

('How is the sum assured calculated in GTL?', 
 'The sum assured in GTL is usually calculated as a multiple of the employee''s annual CTC (Cost to Company). Common multiples are 2x, 3x, or 5x of annual salary.', 
 'India', 'Life', 'GROUP_TERM_LIFE_IND', 'Group Term Life Insurance', 2, true),

('Who can be nominated in GTL?', 
 'Any family member (spouse, children, parents, siblings) can be nominated. Multiple nominees with percentage split are also allowed. Nomination can be changed anytime during employment.', 
 'India', 'Life', 'GROUP_TERM_LIFE_IND', 'Group Term Life Insurance', 3, true),

-- Accident - Global
('What is Group Personal Accident Insurance?', 
 'Group Personal Accident (GPA) insurance provides coverage against accidental death, permanent total disability, permanent partial disability, and temporary total disability.', 
 'Global', 'Accident', 'GPA', 'Group Personal Accident', 1, true),

('What is covered under GPA?', 
 'GPA covers: Accidental death (100% SI), Permanent Total Disability (100% SI), Permanent Partial Disability (% based on body part), Temporary Total Disability (weekly benefit), Medical expenses from accident.', 
 'Global', 'Accident', 'GPA', 'Group Personal Accident', 2, true),

-- Accident - USA
('What does Workers Compensation cover?', 
 'Workers Compensation provides benefits to employees who suffer work-related injuries or illnesses. It covers medical expenses, lost wages, rehabilitation costs, and death benefits.', 
 'USA', 'Accident', 'WORKERS_COMP_USA_ALL', 'Workers Compensation', 1, true),

-- Retirement - India
('What is EPF (Employees Provident Fund)?', 
 'EPF is a statutory retirement savings scheme where both employer and employee contribute 12% of basic salary. It provides retirement corpus, partial withdrawal facility, and pension benefits.', 
 'India', 'Retirement', 'EPF_IND', 'Employees Provident Fund', 1, true),

('What is Gratuity?', 
 'Gratuity is a statutory benefit payable to employees who have completed 5 or more years of continuous service. It is calculated as 15 days salary for each year of service.', 
 'India', 'Retirement', 'GRATUITY_IND', 'Gratuity', 2, true),

('Can I withdraw EPF before retirement?', 
 'Yes, partial withdrawal is allowed for specific purposes: home purchase/construction (after 5 years), medical emergencies, education, marriage, or if unemployed for 2+ months.', 
 'India', 'Retirement', 'EPF_IND', 'Employees Provident Fund', 3, true),

-- Wellness - Global
('What is an Employee Assistance Program (EAP)?', 
 'EAP is a workplace program designed to help employees deal with personal problems that might adversely impact their work performance, health, and well-being. It typically includes counseling services.', 
 'Global', 'Wellness', 'EAP_IND', 'Employee Assistance Program', 1, true),

('Is EAP confidential?', 
 'Yes, EAP services are strictly confidential. Your employer will not know who uses the service or the nature of issues discussed. Only aggregate utilization data is shared.', 
 'Global', 'Wellness', 'EAP_IND', 'Employee Assistance Program', 2, true),

-- Corporate - Global
('What is D&O (Directors & Officers) Liability Insurance?', 
 'D&O insurance protects directors and officers of a company against personal losses if they are sued for alleged wrongful acts while managing the company.', 
 'Global', 'Corporate', 'DNO_GLOBAL', 'Directors & Officers Liability', 1, true),

('What is Professional Indemnity Insurance?', 
 'Professional Indemnity (PI) insurance protects professionals against claims of negligence, errors, or omissions in the services they provide. Also known as Errors & Omissions (E&O) insurance.', 
 'Global', 'Corporate', 'PROF_INDEMNITY_GLOBAL', 'Professional Indemnity', 1, true),

-- General FAQs
('How do I update my dependent information?', 
 'Log in to the employee portal, go to Profile > Dependents section, click Add/Edit Dependent, fill in the details with supporting documents (birth certificate, marriage certificate), and submit for HR approval.', 
 'Global', 'Health', NULL, NULL, 10, true),

('How do I download my E-Card?', 
 'Log in to the employee portal, go to Insurance > E-Cards section, select the policy and family member, click Download. E-cards are available in PDF format and can be saved to your phone wallet.', 
 'Global', 'Health', NULL, NULL, 11, true),

('What happens to my insurance when I resign?', 
 'Coverage typically ends on your last working day or end of the month (as per policy terms). Some insurers offer portability options to convert group coverage to individual policy within 30 days of exit.', 
 'Global', 'Health', NULL, NULL, 12, true)

ON CONFLICT DO NOTHING;

-- =====================================================
-- 6. Useful Views
-- =====================================================

-- View: FAQs with tenant mapping info
CREATE OR REPLACE VIEW v_faqs_with_mappings AS
SELECT 
    f.*,
    CASE 
        WHEN m.is_global = true THEN 'All Tenants'
        WHEN m.tenant_id IS NOT NULL THEN t.corporate_legal_name
        ELSE 'Not Mapped'
    END AS mapped_to,
    m.tenant_id,
    m.is_global
FROM master_faqs f
LEFT JOIN faq_tenant_mappings m ON f.id = m.faq_id AND m.is_active = true
LEFT JOIN tenants t ON m.tenant_id = t.tenant_id;

-- View: Active FAQs for a tenant (includes global FAQs)
CREATE OR REPLACE VIEW v_tenant_faqs AS
SELECT DISTINCT
    f.*,
    COALESCE(m.tenant_id::text, 'global') AS scope
FROM master_faqs f
LEFT JOIN faq_tenant_mappings m ON f.id = m.faq_id AND m.is_active = true
WHERE f.is_active = true
  AND (m.is_global = true OR m.tenant_id IS NOT NULL);

-- =====================================================
-- 7. Helper Functions
-- =====================================================

-- Function: Get FAQs for a specific tenant (includes global FAQs)
CREATE OR REPLACE FUNCTION get_tenant_faqs(p_tenant_id UUID, p_country VARCHAR DEFAULT NULL, p_category VARCHAR DEFAULT NULL)
RETURNS TABLE (
    id UUID,
    question TEXT,
    answer TEXT,
    country VARCHAR,
    category VARCHAR,
    policy_type_code VARCHAR,
    policy_type_name VARCHAR,
    display_order INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT
        f.id,
        f.question,
        f.answer,
        f.country,
        f.category,
        f.policy_type_code,
        f.policy_type_name,
        f.display_order
    FROM master_faqs f
    LEFT JOIN faq_tenant_mappings m ON f.id = m.faq_id AND m.is_active = true
    WHERE f.is_active = true
      AND (m.is_global = true OR m.tenant_id = p_tenant_id)
      AND (p_country IS NULL OR f.country = p_country OR f.country = 'Global')
      AND (p_category IS NULL OR f.category = p_category)
    ORDER BY f.display_order, f.category, f.country;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 8. Grant Permissions (adjust as needed)
-- =====================================================
-- GRANT SELECT, INSERT, UPDATE, DELETE ON master_faqs TO authenticated;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON faq_tenant_mappings TO authenticated;
-- GRANT SELECT ON v_faqs_with_mappings TO authenticated;
-- GRANT SELECT ON v_tenant_faqs TO authenticated;
-- GRANT EXECUTE ON FUNCTION get_tenant_faqs TO authenticated;

-- =====================================================
-- Done! FAQ schema created successfully.
-- =====================================================
