-- Corporate AI Editor Configuration Table
-- Stores which corporates have access to the AI Document Editor module

CREATE TABLE IF NOT EXISTS corporate_ai_editor_config (
    id SERIAL PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    tenant_code VARCHAR(50) NOT NULL,
    enabled BOOLEAN DEFAULT TRUE,
    enabled_for_employees BOOLEAN DEFAULT FALSE,
    assigned_by VARCHAR(255),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    UNIQUE(tenant_id)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_corporate_ai_editor_tenant_code ON corporate_ai_editor_config(tenant_code);
CREATE INDEX IF NOT EXISTS idx_corporate_ai_editor_enabled ON corporate_ai_editor_config(enabled);

-- Comments
COMMENT ON TABLE corporate_ai_editor_config IS 'Configuration for AI Document Editor module access per corporate';
COMMENT ON COLUMN corporate_ai_editor_config.tenant_id IS 'Reference to tenants table';
COMMENT ON COLUMN corporate_ai_editor_config.enabled IS 'Whether the AI Editor is enabled for this corporate admin';
COMMENT ON COLUMN corporate_ai_editor_config.enabled_for_employees IS 'Whether employees of this corporate can also use AI Editor';
COMMENT ON COLUMN corporate_ai_editor_config.assigned_by IS 'Admin who assigned this module';
