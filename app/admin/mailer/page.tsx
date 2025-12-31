"use client";
import React, { useState, useEffect, useCallback } from "react";
import AdminTopBar from "../components/AdminTopBar";
import AdminFooter from "../components/AdminFooter";

// =====================================================
// TYPES
// =====================================================

interface BaseTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  eventType: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

interface CorporateTemplate {
  id: string;
  baseTemplateId: string;
  corporateId: string;
  name: string;
  subject: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  status: string;
}

type TemplateType = 'base' | 'corporate';
type EventType = 'enrollment' | 'wellness' | 'survey' | 'benefits' | 'claims' | 'renewal' | 'general';

const EVENT_TYPES: { value: EventType; label: string; icon: string }[] = [
  { value: 'enrollment', label: 'Enrollment', icon: '📋' },
  { value: 'wellness', label: 'Wellness', icon: '🏃' },
  { value: 'survey', label: 'Survey', icon: '📊' },
  { value: 'benefits', label: 'Benefits', icon: '🎁' },
  { value: 'claims', label: 'Claims', icon: '📄' },
  { value: 'renewal', label: 'Renewal', icon: '🔄' },
  { value: 'general', label: 'General', icon: '📢' },
];

// =====================================================
// API SERVICE
// =====================================================

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://benefitnest-backend.onrender.com';

const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    // Check cookie first, then localStorage
    const cookieToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('admin_token='))
      ?.split('=')[1];
    return cookieToken || localStorage.getItem('admin_token') || '';
  }
  return '';
};

const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }
  
  return response.json();
};

const emailTemplateApi = {
  // Base templates
  getBaseTemplates: (eventType?: string) => 
    apiRequest(`/api/email-templates/base${eventType ? `?eventType=${eventType}` : ''}`),
  getBaseTemplate: (id: string) => 
    apiRequest(`/api/email-templates/base/${id}`),
  createBaseTemplate: (data: Partial<BaseTemplate>) => 
    apiRequest('/api/email-templates/base', { method: 'POST', body: JSON.stringify(data) }),
  updateBaseTemplate: (id: string, data: Partial<BaseTemplate>) => 
    apiRequest(`/api/email-templates/base/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteBaseTemplate: (id: string) => 
    apiRequest(`/api/email-templates/base/${id}`, { method: 'DELETE' }),
  
  // Corporate templates
  getCorporateTemplates: (corporateId?: string) => 
    apiRequest(`/api/email-templates/corporate${corporateId ? `?corporateId=${corporateId}` : ''}`),
  getCorporateTemplate: (id: string) => 
    apiRequest(`/api/email-templates/corporate/${id}`),
  createCorporateTemplate: (data: Partial<CorporateTemplate>) => 
    apiRequest('/api/email-templates/corporate', { method: 'POST', body: JSON.stringify(data) }),
  updateCorporateTemplate: (id: string, data: Partial<CorporateTemplate>) => 
    apiRequest(`/api/email-templates/corporate/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCorporateTemplate: (id: string) => 
    apiRequest(`/api/email-templates/corporate/${id}`, { method: 'DELETE' }),
  
  // Tenants
  getTenants: () => apiRequest('/api/email-templates/tenants'),
  
  // Test email
  sendTestEmail: (data: { recipientEmail: string; subject: string; content: string; templateId?: string; corporateId?: string }) => 
    apiRequest('/api/email-templates/send-test', { method: 'POST', body: JSON.stringify(data) }),
};

// =====================================================
// TEMPLATE CARD COMPONENT
// =====================================================

const TemplateCard: React.FC<{
  template: BaseTemplate | CorporateTemplate;
  type: TemplateType;
  onEdit: () => void;
  onDelete: () => void;
  onTest: () => void;
}> = ({ template, type, onEdit, onDelete, onTest }) => {
  const eventType = type === 'base' ? (template as BaseTemplate).eventType : null;
  const eventInfo = eventType ? EVENT_TYPES.find(e => e.value === eventType) : null;
  
  return (
    <div style={{
      background: '#fff',
      borderRadius: 12,
      border: '1px solid #e5e7eb',
      padding: 20,
      transition: 'all 0.2s',
      cursor: 'pointer',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
      e.currentTarget.style.borderColor = '#3b82f6';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.boxShadow = 'none';
      e.currentTarget.style.borderColor = '#e5e7eb';
    }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            {eventInfo && (
              <span style={{
                background: '#eff6ff',
                color: '#3b82f6',
                padding: '2px 8px',
                borderRadius: 12,
                fontSize: 12,
                fontWeight: 500,
              }}>
                {eventInfo.icon} {eventInfo.label}
              </span>
            )}
            {type === 'corporate' && (
              <span style={{
                background: '#fef3c7',
                color: '#d97706',
                padding: '2px 8px',
                borderRadius: 12,
                fontSize: 12,
                fontWeight: 500,
              }}>
                🏢 Customized
              </span>
            )}
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: '#111827', margin: 0 }}>
            {template.name}
          </h3>
        </div>
      </div>
      
      <p style={{ fontSize: 13, color: '#6b7280', margin: '8px 0', lineHeight: 1.4 }}>
        <strong>Subject:</strong> {template.subject}
      </p>
      
      {type === 'base' && (template as BaseTemplate).description && (
        <p style={{ fontSize: 12, color: '#9ca3af', margin: '8px 0', lineHeight: 1.4 }}>
          {(template as BaseTemplate).description}
        </p>
      )}
      
      <div style={{ 
        display: 'flex', 
        gap: 8, 
        marginTop: 16,
        paddingTop: 12,
        borderTop: '1px solid #f3f4f6'
      }}>
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(); }}
          style={{
            flex: 1,
            padding: '8px 12px',
            background: '#3b82f6',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          ✏️ Edit
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onTest(); }}
          style={{
            padding: '8px 12px',
            background: '#10b981',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          📧 Test
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          style={{
            padding: '8px 12px',
            background: '#fee2e2',
            color: '#dc2626',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          🗑️
        </button>
      </div>
    </div>
  );
};

// =====================================================
// TEMPLATE EDITOR MODAL
// =====================================================

const TemplateEditorModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  template: BaseTemplate | CorporateTemplate | null;
  type: TemplateType;
  baseTemplates?: BaseTemplate[];
  selectedCorporateId?: string;
  onSave: (data: Partial<BaseTemplate | CorporateTemplate>) => Promise<void>;
}> = ({ isOpen, onClose, template, type, baseTemplates, selectedCorporateId, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    content: '',
    eventType: 'general' as EventType,
    description: '',
    baseTemplateId: '',
  });
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        subject: template.subject,
        content: template.content,
        eventType: (type === 'base' ? (template as BaseTemplate).eventType : 'general') as EventType,
        description: type === 'base' ? (template as BaseTemplate).description : '',
        baseTemplateId: type === 'corporate' ? (template as CorporateTemplate).baseTemplateId : '',
      });
    } else {
      setFormData({
        name: '',
        subject: '',
        content: '',
        eventType: 'general',
        description: '',
        baseTemplateId: baseTemplates?.[0]?.id || '',
      });
    }
  }, [template, type, baseTemplates]);

  const handleBaseTemplateChange = (baseId: string) => {
    const baseTemplate = baseTemplates?.find(t => t.id === baseId);
    if (baseTemplate) {
      setFormData(prev => ({
        ...prev,
        baseTemplateId: baseId,
        name: baseTemplate.name,
        subject: baseTemplate.subject,
        content: baseTemplate.content,
      }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (type === 'base') {
        await onSave({
          name: formData.name,
          subject: formData.subject,
          content: formData.content,
          eventType: formData.eventType,
          description: formData.description,
        });
      } else {
        await onSave({
          name: formData.name,
          subject: formData.subject,
          content: formData.content,
          baseTemplateId: formData.baseTemplateId,
          corporateId: selectedCorporateId,
        });
      }
      onClose();
    } catch (error) {
      console.error('Failed to save template:', error);
      alert('Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: 20,
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 16,
        width: '100%',
        maxWidth: 1000,
        maxHeight: '90vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>
            {template ? 'Edit Template' : 'Create New Template'}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 24,
              cursor: 'pointer',
              color: '#6b7280',
            }}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            {/* Left Column - Form */}
            <div>
              {type === 'corporate' && !template && (
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontWeight: 500, marginBottom: 6, fontSize: 14 }}>
                    Base Template *
                  </label>
                  <select
                    value={formData.baseTemplateId}
                    onChange={(e) => handleBaseTemplateChange(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: 8,
                      fontSize: 14,
                    }}
                  >
                    <option value="">Select a base template</option>
                    {baseTemplates?.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontWeight: 500, marginBottom: 6, fontSize: 14 }}>
                  Template Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: 8,
                    fontSize: 14,
                  }}
                  placeholder="Enter template name"
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontWeight: 500, marginBottom: 6, fontSize: 14 }}>
                  Email Subject *
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: 8,
                    fontSize: 14,
                  }}
                  placeholder="Enter email subject (use {{variable}} for dynamic content)"
                />
              </div>

              {type === 'base' && (
                <>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontWeight: 500, marginBottom: 6, fontSize: 14 }}>
                      Event Type *
                    </label>
                    <select
                      value={formData.eventType}
                      onChange={(e) => setFormData(prev => ({ ...prev, eventType: e.target.value as EventType }))}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: 8,
                        fontSize: 14,
                      }}
                    >
                      {EVENT_TYPES.map(et => (
                        <option key={et.value} value={et.value}>{et.icon} {et.label}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontWeight: 500, marginBottom: 6, fontSize: 14 }}>
                      Description
                    </label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: 8,
                        fontSize: 14,
                      }}
                      placeholder="Brief description of when this template is used"
                    />
                  </div>
                </>
              )}

              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label style={{ fontWeight: 500, fontSize: 14 }}>
                    Email Content (HTML) *
                  </label>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button
                      onClick={() => setActiveTab('edit')}
                      style={{
                        padding: '4px 12px',
                        background: activeTab === 'edit' ? '#3b82f6' : '#f3f4f6',
                        color: activeTab === 'edit' ? '#fff' : '#6b7280',
                        border: 'none',
                        borderRadius: 4,
                        fontSize: 12,
                        cursor: 'pointer',
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setActiveTab('preview')}
                      style={{
                        padding: '4px 12px',
                        background: activeTab === 'preview' ? '#3b82f6' : '#f3f4f6',
                        color: activeTab === 'preview' ? '#fff' : '#6b7280',
                        border: 'none',
                        borderRadius: 4,
                        fontSize: 12,
                        cursor: 'pointer',
                      }}
                    >
                      Preview
                    </button>
                  </div>
                </div>
                {activeTab === 'edit' ? (
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    style={{
                      width: '100%',
                      height: 300,
                      padding: 12,
                      border: '1px solid #d1d5db',
                      borderRadius: 8,
                      fontSize: 13,
                      fontFamily: 'monospace',
                      resize: 'vertical',
                    }}
                    placeholder="Enter HTML content..."
                  />
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: 300,
                      padding: 12,
                      border: '1px solid #d1d5db',
                      borderRadius: 8,
                      overflow: 'auto',
                      background: '#fafafa',
                    }}
                    dangerouslySetInnerHTML={{ __html: formData.content }}
                  />
                )}
              </div>

              <div style={{
                background: '#eff6ff',
                padding: 12,
                borderRadius: 8,
                fontSize: 12,
                color: '#1e40af',
              }}>
                <strong>Available Variables:</strong>
                <div style={{ marginTop: 4, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {['{{employee_name}}', '{{corporate_name}}', '{{portal_url}}', '{{plan_name}}', '{{effective_date}}'].map(v => (
                    <code key={v} style={{ background: '#dbeafe', padding: '2px 6px', borderRadius: 4 }}>{v}</code>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Live Preview */}
            <div>
              <div style={{
                background: '#f9fafb',
                borderRadius: 12,
                padding: 16,
                height: '100%',
              }}>
                <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 600, color: '#6b7280' }}>
                  📧 Email Preview
                </h3>
                <div style={{
                  background: '#fff',
                  borderRadius: 8,
                  border: '1px solid #e5e7eb',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid #e5e7eb',
                    background: '#f9fafb',
                  }}>
                    <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>
                      <strong>To:</strong> employee@company.com
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: '#111827' }}>
                      {formData.subject || 'No subject'}
                    </div>
                  </div>
                  <div
                    style={{ padding: 16, fontSize: 14, lineHeight: 1.6 }}
                    dangerouslySetInnerHTML={{ 
                      __html: formData.content
                        .replace(/\{\{employee_name\}\}/g, 'John Doe')
                        .replace(/\{\{corporate_name\}\}/g, 'Acme Corp')
                        .replace(/\{\{portal_url\}\}/g, 'https://portal.example.com')
                        .replace(/\{\{plan_name\}\}/g, 'Gold Health Plan')
                        .replace(/\{\{effective_date\}\}/g, '2024-01-01')
                        || '<p style="color: #9ca3af;">No content yet</p>'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 12,
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              background: '#f3f4f6',
              color: '#374151',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !formData.name || !formData.subject || !formData.content}
            style={{
              padding: '10px 20px',
              background: saving ? '#9ca3af' : '#3b82f6',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              cursor: saving ? 'not-allowed' : 'pointer',
              fontWeight: 500,
            }}
          >
            {saving ? 'Saving...' : 'Save Template'}
          </button>
        </div>
      </div>
    </div>
  );
};

// =====================================================
// TEST EMAIL MODAL
// =====================================================

const TestEmailModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  template: BaseTemplate | CorporateTemplate | null;
  corporateId?: string;
}> = ({ isOpen, onClose, template, corporateId }) => {
  const [recipientEmail, setRecipientEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSend = async () => {
    if (!template || !recipientEmail) return;
    
    setSending(true);
    setResult(null);
    
    try {
      await emailTemplateApi.sendTestEmail({
        recipientEmail,
        subject: template.subject,
        content: template.content,
        templateId: template.id,
        corporateId,
      });
      setResult({ success: true, message: 'Test email sent successfully!' });
      setTimeout(() => {
        onClose();
        setResult(null);
        setRecipientEmail('');
      }, 2000);
    } catch (error) {
      setResult({ success: false, message: 'Failed to send test email' });
    } finally {
      setSending(false);
    }
  };

  if (!isOpen || !template) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 16,
        padding: 24,
        width: '100%',
        maxWidth: 450,
      }}>
        <h2 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 600 }}>
          📧 Send Test Email
        </h2>
        
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontWeight: 500, marginBottom: 6, fontSize: 14 }}>
            Template
          </label>
          <div style={{
            padding: 12,
            background: '#f9fafb',
            borderRadius: 8,
            fontSize: 14,
          }}>
            {template.name}
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontWeight: 500, marginBottom: 6, fontSize: 14 }}>
            Recipient Email *
          </label>
          <input
            type="email"
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #d1d5db',
              borderRadius: 8,
              fontSize: 14,
            }}
            placeholder="test@example.com"
          />
        </div>

        {result && (
          <div style={{
            padding: 12,
            borderRadius: 8,
            marginBottom: 16,
            background: result.success ? '#d1fae5' : '#fee2e2',
            color: result.success ? '#065f46' : '#dc2626',
            fontSize: 14,
          }}>
            {result.message}
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button
            onClick={() => { onClose(); setRecipientEmail(''); setResult(null); }}
            style={{
              padding: '10px 20px',
              background: '#f3f4f6',
              color: '#374151',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={sending || !recipientEmail}
            style={{
              padding: '10px 20px',
              background: sending ? '#9ca3af' : '#10b981',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              cursor: sending ? 'not-allowed' : 'pointer',
              fontWeight: 500,
            }}
          >
            {sending ? 'Sending...' : 'Send Test'}
          </button>
        </div>
      </div>
    </div>
  );
};

// =====================================================
// MAIN PAGE COMPONENT
// =====================================================

export default function Page() {
  const [activeTab, setActiveTab] = useState<TemplateType>('base');
  const [baseTemplates, setBaseTemplates] = useState<BaseTemplate[]>([]);
  const [corporateTemplates, setCorporateTemplates] = useState<CorporateTemplate[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedCorporateId, setSelectedCorporateId] = useState<string>('');
  const [selectedEventType, setSelectedEventType] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [editorOpen, setEditorOpen] = useState(false);
  const [testEmailOpen, setTestEmailOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<BaseTemplate | CorporateTemplate | null>(null);
  const [editingType, setEditingType] = useState<TemplateType>('base');

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [baseRes, tenantsRes] = await Promise.all([
        emailTemplateApi.getBaseTemplates(selectedEventType || undefined),
        emailTemplateApi.getTenants(),
      ]);
      
      setBaseTemplates(baseRes.data || []);
      setTenants(tenantsRes.data || []);
      
      if (selectedCorporateId) {
        const corpRes = await emailTemplateApi.getCorporateTemplates(selectedCorporateId);
        setCorporateTemplates(corpRes.data || []);
      } else {
        setCorporateTemplates([]);
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('Failed to load templates. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, [selectedEventType, selectedCorporateId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handlers
  const handleCreateTemplate = () => {
    setEditingTemplate(null);
    setEditingType(activeTab);
    setEditorOpen(true);
  };

  const handleEditTemplate = (template: BaseTemplate | CorporateTemplate, type: TemplateType) => {
    setEditingTemplate(template);
    setEditingType(type);
    setEditorOpen(true);
  };

  const handleDeleteTemplate = async (template: BaseTemplate | CorporateTemplate, type: TemplateType) => {
    if (!confirm(`Are you sure you want to delete "${template.name}"?`)) return;
    
    try {
      if (type === 'base') {
        await emailTemplateApi.deleteBaseTemplate(template.id);
      } else {
        await emailTemplateApi.deleteCorporateTemplate(template.id);
      }
      fetchData();
    } catch (err) {
      console.error('Failed to delete template:', err);
      alert('Failed to delete template');
    }
  };

  const handleTestEmail = (template: BaseTemplate | CorporateTemplate) => {
    setEditingTemplate(template);
    setTestEmailOpen(true);
  };

  const handleSaveTemplate = async (data: Partial<BaseTemplate | CorporateTemplate>) => {
    if (editingType === 'base') {
      if (editingTemplate) {
        await emailTemplateApi.updateBaseTemplate(editingTemplate.id, data as Partial<BaseTemplate>);
      } else {
        await emailTemplateApi.createBaseTemplate(data as Partial<BaseTemplate>);
      }
    } else {
      if (editingTemplate) {
        await emailTemplateApi.updateCorporateTemplate(editingTemplate.id, data as Partial<CorporateTemplate>);
      } else {
        await emailTemplateApi.createCorporateTemplate(data as Partial<CorporateTemplate>);
      }
    }
    fetchData();
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", display: "flex", flexDirection: "column" }}>
      <AdminTopBar
        title="Email Template Manager"
        subtitle="Create and manage email templates for communications with employees and corporates."
        icon={<span style={{ fontSize: 24 }}>📧</span>}
        showBack={true}
      />
      
      <main style={{ flex: 1, width: "100%", maxWidth: 1400, margin: "0 auto", padding: 24 }}>
        {/* Tabs & Filters */}
        <div style={{
          background: '#fff',
          borderRadius: 12,
          padding: 16,
          marginBottom: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
        }}>
          {/* Tab Buttons */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setActiveTab('base')}
              style={{
                padding: '10px 20px',
                background: activeTab === 'base' ? '#3b82f6' : '#f3f4f6',
                color: activeTab === 'base' ? '#fff' : '#374151',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: 14,
              }}
            >
              📋 Base Templates
            </button>
            <button
              onClick={() => setActiveTab('corporate')}
              style={{
                padding: '10px 20px',
                background: activeTab === 'corporate' ? '#3b82f6' : '#f3f4f6',
                color: activeTab === 'corporate' ? '#fff' : '#374151',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: 14,
              }}
            >
              🏢 Corporate Templates
            </button>
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            {activeTab === 'base' && (
              <select
                value={selectedEventType}
                onChange={(e) => setSelectedEventType(e.target.value)}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: 8,
                  fontSize: 14,
                }}
              >
                <option value="">All Event Types</option>
                {EVENT_TYPES.map(et => (
                  <option key={et.value} value={et.value}>{et.icon} {et.label}</option>
                ))}
              </select>
            )}

            {activeTab === 'corporate' && (
              <select
                value={selectedCorporateId}
                onChange={(e) => setSelectedCorporateId(e.target.value)}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: 8,
                  fontSize: 14,
                  minWidth: 200,
                }}
              >
                <option value="">Select Corporate</option>
                {tenants.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            )}

            <button
              onClick={handleCreateTemplate}
              disabled={activeTab === 'corporate' && !selectedCorporateId}
              style={{
                padding: '10px 16px',
                background: (activeTab === 'corporate' && !selectedCorporateId) ? '#d1d5db' : '#3b82f6',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                cursor: (activeTab === 'corporate' && !selectedCorporateId) ? 'not-allowed' : 'pointer',
                fontWeight: 500,
                fontSize: 14,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              ➕ Create Template
            </button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div style={{
            background: '#fee2e2',
            color: '#dc2626',
            padding: 16,
            borderRadius: 8,
            marginBottom: 24,
          }}>
            {error}
            <button
              onClick={fetchData}
              style={{
                marginLeft: 12,
                padding: '4px 12px',
                background: '#dc2626',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 60,
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
              <p style={{ color: '#6b7280' }}>Loading templates...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Base Templates Grid */}
            {activeTab === 'base' && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: 20,
              }}>
                {baseTemplates.length === 0 ? (
                  <div style={{
                    gridColumn: '1 / -1',
                    textAlign: 'center',
                    padding: 60,
                    background: '#fff',
                    borderRadius: 12,
                    border: '2px dashed #e5e7eb',
                  }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
                    <h3 style={{ margin: '0 0 8px', color: '#374151' }}>No templates found</h3>
                    <p style={{ color: '#6b7280', marginBottom: 16 }}>
                      {selectedEventType ? 'No templates match the selected event type.' : 'Create your first email template to get started.'}
                    </p>
                    <button
                      onClick={handleCreateTemplate}
                      style={{
                        padding: '10px 20px',
                        background: '#3b82f6',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 8,
                        cursor: 'pointer',
                        fontWeight: 500,
                      }}
                    >
                      ➕ Create Template
                    </button>
                  </div>
                ) : (
                  baseTemplates.map(template => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      type="base"
                      onEdit={() => handleEditTemplate(template, 'base')}
                      onDelete={() => handleDeleteTemplate(template, 'base')}
                      onTest={() => handleTestEmail(template)}
                    />
                  ))
                )}
              </div>
            )}

            {/* Corporate Templates */}
            {activeTab === 'corporate' && (
              <>
                {!selectedCorporateId ? (
                  <div style={{
                    textAlign: 'center',
                    padding: 60,
                    background: '#fff',
                    borderRadius: 12,
                    border: '2px dashed #e5e7eb',
                  }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>🏢</div>
                    <h3 style={{ margin: '0 0 8px', color: '#374151' }}>Select a Corporate</h3>
                    <p style={{ color: '#6b7280' }}>
                      Choose a corporate from the dropdown to view or create customized templates.
                    </p>
                  </div>
                ) : (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                    gap: 20,
                  }}>
                    {corporateTemplates.length === 0 ? (
                      <div style={{
                        gridColumn: '1 / -1',
                        textAlign: 'center',
                        padding: 60,
                        background: '#fff',
                        borderRadius: 12,
                        border: '2px dashed #e5e7eb',
                      }}>
                        <div style={{ fontSize: 48, marginBottom: 12 }}>📝</div>
                        <h3 style={{ margin: '0 0 8px', color: '#374151' }}>No custom templates</h3>
                        <p style={{ color: '#6b7280', marginBottom: 16 }}>
                          This corporate is using base templates. Create a custom template to override.
                        </p>
                        <button
                          onClick={handleCreateTemplate}
                          style={{
                            padding: '10px 20px',
                            background: '#3b82f6',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 8,
                            cursor: 'pointer',
                            fontWeight: 500,
                          }}
                        >
                          ➕ Create Custom Template
                        </button>
                      </div>
                    ) : (
                      corporateTemplates.map(template => (
                        <TemplateCard
                          key={template.id}
                          template={template}
                          type="corporate"
                          onEdit={() => handleEditTemplate(template, 'corporate')}
                          onDelete={() => handleDeleteTemplate(template, 'corporate')}
                          onTest={() => handleTestEmail(template)}
                        />
                      ))
                    )}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </main>

      <AdminFooter />

      {/* Modals */}
      <TemplateEditorModal
        isOpen={editorOpen}
        onClose={() => setEditorOpen(false)}
        template={editingTemplate}
        type={editingType}
        baseTemplates={baseTemplates}
        selectedCorporateId={selectedCorporateId}
        onSave={handleSaveTemplate}
      />

      <TestEmailModal
        isOpen={testEmailOpen}
        onClose={() => setTestEmailOpen(false)}
        template={editingTemplate}
        corporateId={selectedCorporateId}
      />
    </div>
  );
}
