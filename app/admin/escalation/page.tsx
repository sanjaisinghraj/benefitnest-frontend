'use client';
import { useState, useEffect, useRef } from 'react';

const API_BASE = 'https://benefitnest-backend.onrender.com';

// Category tabs
const CATEGORY_TABS = [
  { id: 'enrollment', name: 'Enrollment', icon: '📝' },
  { id: 'benefit', name: 'Benefits', icon: '🎁' },
  { id: 'claim', name: 'Claims', icon: '📋' },
  { id: 'wellness', name: 'Wellness', icon: '💪' },
  { id: 'marketplace', name: 'Marketplace', icon: '🛒' },
  { id: 'rewards', name: 'R&R', icon: '🏆' },
  { id: 'technical', name: 'Technical', icon: '🔧' },
  { id: 'event', name: 'Events', icon: '📅' },
];

// Level configurations
const LEVEL_CONFIG = [
  { level: 1, name: 'Level 1 - First Contact', color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
  { level: 2, name: 'Level 2 - Supervisor', color: 'from-orange-500 to-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' },
  { level: 3, name: 'Level 3 - Management', color: 'from-red-500 to-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200' },
];

interface Tenant {
  id: string;
  tenant_code: string;
  corporate_legal_name: string;
  subdomain?: string;
}

interface Category {
  id: string;
  name: string;
  display_name: string;
  icon: string;
}

interface EscalationContact {
  id?: string;
  tenant_id: string;
  tenant_code: string;
  category_id: string;
  level: number;
  level_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  organization_name: string;
  designation: string;
  level_description: string;
  response_time: string;
  faq_category_id: string | null;
  faq_link_text: string;
  ai_enabled: boolean;
  ai_context: string;
  email_enabled: boolean;
  call_enabled: boolean;
  chat_enabled: boolean;
  category?: Category;
}

interface Document {
  id: string;
  document_name: string;
  document_type: string;
  document_url: string;
  file_size_bytes: number;
  created_at: string;
}

interface FaqCategory {
  id: string;
  name: string;
  display_name: string;
}

export default function EscalationMatrixPage() {
  // State
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState('enrollment');
  const [matrix, setMatrix] = useState<EscalationContact[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [faqCategories, setFaqCategories] = useState<FaqCategory[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingContact, setEditingContact] = useState<Partial<EscalationContact> | null>(null);
  const [editingLevel, setEditingLevel] = useState(1);
  
  // Document upload
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // AI Chat
  const [showAiChat, setShowAiChat] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('admin_token') || localStorage.getItem('jwt');
    }
    return null;
  };

  // Fetch tenants
  const fetchTenants = async () => {
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/api/admin/escalation/tenants`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setTenants(data.tenants || []);
      }
    } catch (err) {
      console.error('Error fetching tenants:', err);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/api/admin/escalation/categories`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  // Fetch FAQ categories
  const fetchFaqCategories = async () => {
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/api/admin/escalation/faq-categories`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setFaqCategories(data.categories || []);
      }
    } catch (err) {
      console.error('Error fetching FAQ categories:', err);
    }
  };

  // Fetch matrix for selected tenant
  const fetchMatrix = async () => {
    if (!selectedTenant) return;
    setLoading(true);
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/api/admin/escalation/matrix/${selectedTenant.tenant_code}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setMatrix(data.matrix || []);
      }
    } catch (err) {
      console.error('Error fetching matrix:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch documents
  const fetchDocuments = async () => {
    if (!selectedTenant) return;
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/api/admin/escalation/documents/${selectedTenant.tenant_code}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setDocuments(data.documents || []);
      }
    } catch (err) {
      console.error('Error fetching documents:', err);
    }
  };

  useEffect(() => {
    fetchTenants();
    fetchCategories();
    fetchFaqCategories();
  }, []);

  useEffect(() => {
    if (selectedTenant) {
      fetchMatrix();
      fetchDocuments();
    }
  }, [selectedTenant]);

  // Get contacts for current category and level
  const getContactsForLevel = (level: number): EscalationContact | undefined => {
    const category = categories.find(c => c.name === activeTab);
    if (!category) return undefined;
    return matrix.find(m => m.category_id === category.id && m.level === level);
  };

  // Open edit modal
  const openEditModal = (level: number, existing?: EscalationContact) => {
    const category = categories.find(c => c.name === activeTab);
    if (!category || !selectedTenant) return;

    setEditingLevel(level);
    setEditingContact(existing || {
      tenant_id: selectedTenant.id,
      tenant_code: selectedTenant.tenant_code,
      category_id: category.id,
      level,
      level_name: LEVEL_CONFIG.find(l => l.level === level)?.name || `Level ${level}`,
      contact_name: '',
      contact_email: '',
      contact_phone: '',
      organization_name: '',
      designation: '',
      level_description: '',
      response_time: '',
      faq_category_id: null,
      faq_link_text: '',
      ai_enabled: true,
      ai_context: '',
      email_enabled: true,
      call_enabled: true,
      chat_enabled: true,
    });
    setShowEditModal(true);
  };

  // Save contact
  const saveContact = async () => {
    if (!editingContact) return;
    setLoading(true);
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/api/admin/escalation/matrix`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: editingContact.id,
          tenantId: editingContact.tenant_id,
          tenantCode: editingContact.tenant_code,
          categoryId: editingContact.category_id,
          level: editingContact.level,
          levelName: editingContact.level_name,
          contactName: editingContact.contact_name,
          contactEmail: editingContact.contact_email,
          contactPhone: editingContact.contact_phone,
          organizationName: editingContact.organization_name,
          designation: editingContact.designation,
          levelDescription: editingContact.level_description,
          responseTime: editingContact.response_time,
          faqCategoryId: editingContact.faq_category_id,
          faqLinkText: editingContact.faq_link_text,
          aiEnabled: editingContact.ai_enabled,
          aiContext: editingContact.ai_context,
          emailEnabled: editingContact.email_enabled,
          callEnabled: editingContact.call_enabled,
          chatEnabled: editingContact.chat_enabled,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowEditModal(false);
        fetchMatrix();
      } else {
        alert(data.error || 'Failed to save');
      }
    } catch (err) {
      console.error('Error saving contact:', err);
      alert('Failed to save contact');
    } finally {
      setLoading(false);
    }
  };

  // Delete contact
  const deleteContact = async (id: string) => {
    if (!confirm('Are you sure you want to delete this contact?')) return;
    try {
      const token = getToken();
      await fetch(`${API_BASE}/api/admin/escalation/matrix/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      fetchMatrix();
    } catch (err) {
      console.error('Error deleting:', err);
    }
  };

  // Upload document
  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedTenant) return;

    setUploading(true);
    try {
      const token = getToken();
      const formData = new FormData();
      formData.append('file', file);
      formData.append('tenantId', selectedTenant.id);
      formData.append('tenantCode', selectedTenant.tenant_code);

      const res = await fetch(`${API_BASE}/api/admin/escalation/documents/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        fetchDocuments();
      } else {
        alert(data.error || 'Upload failed');
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Delete document
  const deleteDocument = async (id: string) => {
    if (!confirm('Delete this document?')) return;
    try {
      const token = getToken();
      await fetch(`${API_BASE}/api/admin/escalation/documents/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      fetchDocuments();
    } catch (err) {
      console.error('Error deleting document:', err);
    }
  };

  // AI Query
  const handleAiQuery = async () => {
    if (!aiQuery.trim() || !selectedTenant) return;
    setAiLoading(true);
    try {
      const token = getToken();
      const category = categories.find(c => c.name === activeTab);
      const res = await fetch(`${API_BASE}/api/admin/escalation/ai/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          tenantCode: selectedTenant.tenant_code,
          query: aiQuery,
          categoryId: category?.id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAiResponse(data.response);
      } else {
        setAiResponse('Sorry, I could not process your query.');
      }
    } catch (err) {
      setAiResponse('An error occurred. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">🎯 Escalation Matrix</h1>
        <p className="text-gray-600 mt-1">Configure escalation contacts for each corporate</p>
      </div>

      {/* Tenant Selection */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Corporate/Tenant</label>
        <select
          value={selectedTenant?.id || ''}
          onChange={(e) => {
            const t = tenants.find(t => t.id === e.target.value);
            setSelectedTenant(t || null);
          }}
          className="w-full max-w-md px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">-- Select a Corporate --</option>
          {tenants.map(t => (
            <option key={t.id} value={t.id}>
              {t.corporate_legal_name} ({t.tenant_code})
            </option>
          ))}
        </select>
      </div>

      {selectedTenant && (
        <>
          {/* Category Tabs */}
          <div className="bg-white rounded-xl shadow-sm mb-6 overflow-hidden">
            <div className="flex overflow-x-auto">
              {CATEGORY_TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-shrink-0 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600 bg-indigo-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </div>
          </div>

          {/* AI Assistant Button */}
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setShowAiChat(!showAiChat)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:opacity-90 shadow-lg"
            >
              🤖 AI Assistant
            </button>
          </div>

          {/* AI Chat Panel */}
          {showAiChat && (
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl shadow-sm p-6 mb-6 border border-purple-200">
              <h3 className="font-semibold text-purple-800 mb-4">🤖 AI Escalation Assistant</h3>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAiQuery()}
                  placeholder="Ask a question about escalation... e.g., 'Who should I contact for claim issues?'"
                  className="flex-1 px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={handleAiQuery}
                  disabled={aiLoading}
                  className="px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {aiLoading ? '...' : 'Ask'}
                </button>
              </div>
              {aiResponse && (
                <div className="mt-4 p-4 bg-white rounded-lg border border-purple-200">
                  <div className="prose prose-sm max-w-none whitespace-pre-wrap">{aiResponse}</div>
                </div>
              )}
            </div>
          )}

          {/* Escalation Levels */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {LEVEL_CONFIG.map(levelConfig => {
              const contact = getContactsForLevel(levelConfig.level);
              return (
                <div 
                  key={levelConfig.level} 
                  className={`bg-white rounded-xl shadow-sm overflow-hidden border-2 ${levelConfig.borderColor}`}
                >
                  {/* Level Header */}
                  <div className={`bg-gradient-to-r ${levelConfig.color} p-4 text-white`}>
                    <h3 className="font-bold text-lg">{levelConfig.name}</h3>
                  </div>

                  {/* Contact Details */}
                  <div className="p-5">
                    {contact ? (
                      <div className="space-y-4">
                        {/* Contact Info */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">👤</span>
                            <div>
                              <div className="font-semibold text-gray-800">{contact.contact_name}</div>
                              <div className="text-sm text-gray-500">{contact.designation}</div>
                            </div>
                          </div>
                          <div className="text-sm text-gray-600">
                            <div>📧 {contact.contact_email}</div>
                            {contact.contact_phone && <div>📱 {contact.contact_phone}</div>}
                            {contact.organization_name && <div>🏢 {contact.organization_name}</div>}
                          </div>
                        </div>

                        {/* Description */}
                        {contact.level_description && (
                          <div className={`p-3 rounded-lg ${levelConfig.bgColor}`}>
                            <div className="text-xs font-medium text-gray-500 mb-1">Handles:</div>
                            <div className="text-sm text-gray-700">{contact.level_description}</div>
                          </div>
                        )}

                        {/* Response Time */}
                        {contact.response_time && (
                          <div className="text-sm text-gray-500">
                            ⏱️ Response: {contact.response_time}
                          </div>
                        )}

                        {/* FAQ Link */}
                        {contact.faq_category_id && (
                          <a 
                            href={`/admin/faq?category=${contact.faq_category_id}`}
                            className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:underline"
                          >
                            📚 {contact.faq_link_text || 'View FAQs'}
                          </a>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-2">
                          {contact.email_enabled && (
                            <a 
                              href={`mailto:${contact.contact_email}`}
                              className="flex-1 text-center px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200"
                            >
                              ✉️ Email
                            </a>
                          )}
                          {contact.call_enabled && contact.contact_phone && (
                            <a 
                              href={`tel:${contact.contact_phone}`}
                              className="flex-1 text-center px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200"
                            >
                              📞 Call
                            </a>
                          )}
                          {contact.chat_enabled && (
                            <button className="flex-1 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm hover:bg-purple-200">
                              💬 Chat
                            </button>
                          )}
                        </div>

                        {/* AI Badge */}
                        {contact.ai_enabled && (
                          <div className="text-xs text-purple-600 flex items-center gap-1">
                            🤖 AI-assisted support enabled
                          </div>
                        )}

                        {/* Edit/Delete */}
                        <div className="flex gap-2 pt-2 border-t">
                          <button
                            onClick={() => openEditModal(levelConfig.level, contact)}
                            className="flex-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => deleteContact(contact.id!)}
                            className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="text-4xl mb-2">➕</div>
                        <p className="text-gray-500 mb-4">No contact configured</p>
                        <button
                          onClick={() => openEditModal(levelConfig.level)}
                          className={`px-4 py-2 bg-gradient-to-r ${levelConfig.color} text-white rounded-lg hover:opacity-90`}
                        >
                          Add Contact
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Documents Section */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-800">📄 Escalation Documents</h3>
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx"
                  onChange={handleDocumentUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : '📤 Upload Document'}
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-4">Upload PDF, Word, or PowerPoint files</p>
            
            {documents.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No documents uploaded yet
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {documents.map(doc => (
                  <div key={doc.id} className="border rounded-lg p-4 flex items-start gap-3">
                    <div className="text-3xl">
                      {doc.document_type === 'pdf' ? '📕' : 
                       doc.document_type?.includes('doc') ? '📘' : '📙'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-800 truncate">{doc.document_name}</div>
                      <div className="text-xs text-gray-500">
                        {(doc.file_size_bytes / 1024).toFixed(1)} KB • {new Date(doc.created_at).toLocaleDateString()}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <a
                          href={doc.document_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-indigo-600 hover:underline"
                        >
                          View
                        </a>
                        <button
                          onClick={() => deleteDocument(doc.id)}
                          className="text-xs text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Edit Modal */}
      {showEditModal && editingContact && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6 border-b sticky top-0 bg-white flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">
                {editingContact.id ? 'Edit Contact' : 'Add Contact'} - Level {editingLevel}
              </h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Contact Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name *</label>
                  <input
                    type="text"
                    value={editingContact.contact_name || ''}
                    onChange={(e) => setEditingContact({...editingContact, contact_name: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                  <input
                    type="text"
                    value={editingContact.designation || ''}
                    onChange={(e) => setEditingContact({...editingContact, designation: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={editingContact.contact_email || ''}
                    onChange={(e) => setEditingContact({...editingContact, contact_email: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={editingContact.contact_phone || ''}
                    onChange={(e) => setEditingContact({...editingContact, contact_phone: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name</label>
                <input
                  type="text"
                  value={editingContact.organization_name || ''}
                  onChange={(e) => setEditingContact({...editingContact, organization_name: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Level Description</label>
                <textarea
                  value={editingContact.level_description || ''}
                  onChange={(e) => setEditingContact({...editingContact, level_description: e.target.value})}
                  rows={3}
                  placeholder="What types of queries can be raised to this level?"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Response Time</label>
                  <input
                    type="text"
                    value={editingContact.response_time || ''}
                    onChange={(e) => setEditingContact({...editingContact, response_time: e.target.value})}
                    placeholder="e.g., Within 24 hours"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Link to FAQ Section</label>
                  <select
                    value={editingContact.faq_category_id || ''}
                    onChange={(e) => setEditingContact({...editingContact, faq_category_id: e.target.value || null})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">-- No FAQ Link --</option>
                    {faqCategories.map(faq => (
                      <option key={faq.id} value={faq.id}>{faq.display_name || faq.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">FAQ Link Text</label>
                <input
                  type="text"
                  value={editingContact.faq_link_text || ''}
                  onChange={(e) => setEditingContact({...editingContact, faq_link_text: e.target.value})}
                  placeholder="e.g., View Enrollment FAQs"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Communication Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Communication Options</label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editingContact.email_enabled}
                      onChange={(e) => setEditingContact({...editingContact, email_enabled: e.target.checked})}
                      className="rounded text-indigo-600"
                    />
                    ✉️ Email
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editingContact.call_enabled}
                      onChange={(e) => setEditingContact({...editingContact, call_enabled: e.target.checked})}
                      className="rounded text-indigo-600"
                    />
                    📞 Call
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editingContact.chat_enabled}
                      onChange={(e) => setEditingContact({...editingContact, chat_enabled: e.target.checked})}
                      className="rounded text-indigo-600"
                    />
                    💬 Chat
                  </label>
                </div>
              </div>

              {/* AI Settings */}
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <label className="flex items-center gap-2 mb-3">
                  <input
                    type="checkbox"
                    checked={editingContact.ai_enabled}
                    onChange={(e) => setEditingContact({...editingContact, ai_enabled: e.target.checked})}
                    className="rounded text-purple-600"
                  />
                  <span className="font-medium text-purple-800">🤖 Enable AI Assistance</span>
                </label>
                {editingContact.ai_enabled && (
                  <div>
                    <label className="block text-sm text-purple-700 mb-1">AI Context (additional knowledge for this level)</label>
                    <textarea
                      value={editingContact.ai_context || ''}
                      onChange={(e) => setEditingContact({...editingContact, ai_context: e.target.value})}
                      rows={2}
                      placeholder="Add specific information the AI should know about this escalation level..."
                      className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={saveContact}
                disabled={loading || !editingContact.contact_name || !editingContact.contact_email}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Contact'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
