'use client';
import { useState, useEffect } from 'react';
import AdminTopBar from '../components/AdminTopBar';
import AdminFooter from '../components/AdminFooter';

const API_BASE = 'https://benefitnest-backend.onrender.com';

interface Analytics {
  totalConversations: number;
  activeConversations: number;
  escalatedToday: number;
  categoryBreakdown: Record<string, number>;
  avgRating: number | null;
}

interface Conversation {
  id: string;
  user_name: string;
  user_email: string;
  tenant_code: string;
  category: string;
  status: string;
  message_count: number;
  escalated: boolean;
  user_rating: number;
  last_message_at: string;
  created_at: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

interface KnowledgeEntry {
  id: string;
  category: string;
  title: string;
  content: string;
  question: string;
  answer: string;
  is_global: boolean;
  times_used: number;
  helpful_count: number;
  priority: number;
}

const CATEGORY_OPTIONS = ['benefits', 'claims', 'enrollment', 'wellness', 'technical', 'general'];

export default function ChatbotAdminPage() {
  const [activeTab, setActiveTab] = useState<'analytics' | 'conversations' | 'knowledge'>('analytics');
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [knowledge, setKnowledge] = useState<KnowledgeEntry[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Conversation detail
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [conversationMessages, setConversationMessages] = useState<Message[]>([]);
  
  // Knowledge form
  const [showKnowledgeForm, setShowKnowledgeForm] = useState(false);
  const [editingKnowledge, setEditingKnowledge] = useState<Partial<KnowledgeEntry> | null>(null);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('admin_token') || localStorage.getItem('jwt');
    }
    return null;
  };

  // Fetch analytics
  const fetchAnalytics = async () => {
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/api/admin/chatbot/admin/analytics`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setAnalytics(data.analytics);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
    }
  };

  // Fetch conversations
  const fetchConversations = async () => {
    setLoading(true);
    try {
      const token = getToken();
      let url = `${API_BASE}/api/admin/chatbot/admin/conversations?limit=50`;
      if (statusFilter) url += `&status=${statusFilter}`;
      if (categoryFilter) url += `&category=${categoryFilter}`;
      
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setConversations(data.conversations || []);
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch conversation detail
  const fetchConversationDetail = async (id: string) => {
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/api/admin/chatbot/conversation/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setConversationMessages(data.messages || []);
      }
    } catch (err) {
      console.error('Error fetching conversation:', err);
    }
  };

  // Fetch knowledge base
  const fetchKnowledge = async () => {
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/api/admin/chatbot/admin/knowledge`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setKnowledge(data.knowledge || []);
      }
    } catch (err) {
      console.error('Error fetching knowledge:', err);
    }
  };

  // Save knowledge entry
  const saveKnowledge = async () => {
    if (!editingKnowledge?.title || !editingKnowledge?.content) return;
    
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/api/admin/chatbot/admin/knowledge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          isGlobal: editingKnowledge.is_global ?? true,
          category: editingKnowledge.category || 'general',
          title: editingKnowledge.title,
          content: editingKnowledge.content,
          question: editingKnowledge.question,
          answer: editingKnowledge.answer,
          priority: editingKnowledge.priority || 50
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowKnowledgeForm(false);
        setEditingKnowledge(null);
        fetchKnowledge();
      }
    } catch (err) {
      console.error('Error saving knowledge:', err);
    }
  };

  // Delete knowledge entry
  const deleteKnowledge = async (id: string) => {
    if (!confirm('Delete this knowledge entry?')) return;
    
    try {
      const token = getToken();
      await fetch(`${API_BASE}/api/admin/chatbot/admin/knowledge/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchKnowledge();
    } catch (err) {
      console.error('Error deleting knowledge:', err);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    fetchConversations();
    fetchKnowledge();
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [statusFilter, categoryFilter]);

  useEffect(() => {
    if (selectedConversation) {
      fetchConversationDetail(selectedConversation.id);
    }
  }, [selectedConversation]);

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <AdminTopBar 
        title="Chatbot Management" 
        subtitle="Monitor conversations and manage AI knowledge base"
        icon={<span style={{ fontSize: 28 }}>🤖</span>}
      />
      
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '24px' }}>
        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-6 overflow-hidden">
          <div className="flex border-b">
            {[
              { id: 'analytics', label: '📊 Analytics', icon: '📊' },
              { id: 'conversations', label: '💬 Conversations', icon: '💬' },
              { id: 'knowledge', label: '📚 Knowledge Base', icon: '📚' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-b-2 border-indigo-500 text-indigo-600 bg-indigo-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="text-3xl mb-2">💬</div>
                <div className="text-2xl font-bold text-gray-800">
                  {analytics?.totalConversations || 0}
                </div>
                <div className="text-sm text-gray-500">Total Conversations</div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="text-3xl mb-2">🟢</div>
                <div className="text-2xl font-bold text-green-600">
                  {analytics?.activeConversations || 0}
                </div>
                <div className="text-sm text-gray-500">Active Now</div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="text-3xl mb-2">🔺</div>
                <div className="text-2xl font-bold text-orange-600">
                  {analytics?.escalatedToday || 0}
                </div>
                <div className="text-sm text-gray-500">Escalated Today</div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="text-3xl mb-2">⭐</div>
                <div className="text-2xl font-bold text-yellow-600">
                  {analytics?.avgRating || '-'}
                </div>
                <div className="text-sm text-gray-500">Avg Rating</div>
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-800 mb-4">📊 Queries by Category</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {Object.entries(analytics?.categoryBreakdown || {}).map(([cat, count]) => (
                  <div key={cat} className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-xl font-bold text-indigo-600">{count}</div>
                    <div className="text-sm text-gray-600 capitalize">{cat}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Conversations Tab */}
        {activeTab === 'conversations' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Conversation List */}
            <div className="lg:col-span-1">
              {/* Filters */}
              <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
                <div className="flex gap-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-lg text-sm"
                  >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="closed">Closed</option>
                    <option value="escalated">Escalated</option>
                  </select>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-lg text-sm"
                  >
                    <option value="">All Categories</option>
                    {CATEGORY_OPTIONS.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* List */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="max-h-[600px] overflow-y-auto">
                  {conversations.map(conv => (
                    <div
                      key={conv.id}
                      onClick={() => setSelectedConversation(conv)}
                      className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedConversation?.id === conv.id ? 'bg-indigo-50' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-medium text-gray-800 truncate">
                          {conv.user_name || conv.user_email || 'Anonymous'}
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          conv.status === 'active' ? 'bg-green-100 text-green-700' :
                          conv.status === 'escalated' ? 'bg-orange-100 text-orange-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {conv.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="capitalize">{conv.category || 'general'}</span>
                        <span>•</span>
                        <span>{conv.message_count} msgs</span>
                        {conv.escalated && <span>• 🔺</span>}
                        {conv.user_rating && <span>• ⭐{conv.user_rating}</span>}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(conv.last_message_at).toLocaleString()}
                      </div>
                    </div>
                  ))}
                  {conversations.length === 0 && (
                    <div className="p-8 text-center text-gray-400">
                      No conversations found
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Conversation Detail */}
            <div className="lg:col-span-2">
              {selectedConversation ? (
                <div className="bg-white rounded-xl shadow-sm">
                  {/* Header */}
                  <div className="p-4 border-b">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold text-gray-800">
                          {selectedConversation.user_name || 'Anonymous User'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {selectedConversation.user_email}
                        </div>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        <div>Tenant: {selectedConversation.tenant_code || 'N/A'}</div>
                        <div>Started: {new Date(selectedConversation.created_at).toLocaleString()}</div>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="p-4 max-h-[500px] overflow-y-auto bg-gray-50">
                    <div className="space-y-4">
                      {conversationMessages.map(msg => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] p-3 rounded-lg ${
                              msg.role === 'user'
                                ? 'bg-indigo-600 text-white rounded-br-none'
                                : 'bg-white shadow rounded-bl-none'
                            }`}
                          >
                            <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                            <div className={`text-xs mt-1 ${msg.role === 'user' ? 'text-indigo-200' : 'text-gray-400'}`}>
                              {new Date(msg.created_at).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                  <div className="text-6xl mb-4">💬</div>
                  <div className="text-gray-500">Select a conversation to view details</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Knowledge Base Tab */}
        {activeTab === 'knowledge' && (
          <div>
            {/* Add Button */}
            <div className="flex justify-end mb-4">
              <button
                onClick={() => {
                  setEditingKnowledge({ is_global: true, category: 'general', priority: 50 });
                  setShowKnowledgeForm(true);
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                ➕ Add Knowledge Entry
              </button>
            </div>

            {/* Knowledge List */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Title</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Scope</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Usage</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Priority</th>
                    <th className="px-6 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {knowledge.map(kb => (
                    <tr key={kb.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-800">{kb.title}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">{kb.question || kb.content}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-gray-100 rounded text-sm capitalize">{kb.category}</span>
                      </td>
                      <td className="px-6 py-4">
                        {kb.is_global ? (
                          <span className="text-green-600">🌐 Global</span>
                        ) : (
                          <span className="text-blue-600">🏢 Tenant</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <span className="text-gray-600">{kb.times_used} uses</span>
                          <span className="mx-2">•</span>
                          <span className="text-green-600">👍 {kb.helpful_count}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">{kb.priority}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => deleteKnowledge(kb.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {knowledge.length === 0 && (
                <div className="p-8 text-center text-gray-400">
                  No knowledge entries yet. Add some to help the chatbot answer better!
                </div>
              )}
            </div>
          </div>
        )}

        {/* Knowledge Form Modal */}
        {showKnowledgeForm && editingKnowledge && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
              <div className="p-6 border-b flex justify-between items-center">
                <h3 className="text-lg font-semibold">Add Knowledge Entry</h3>
                <button onClick={() => setShowKnowledgeForm(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={editingKnowledge.category || 'general'}
                      onChange={(e) => setEditingKnowledge({...editingKnowledge, category: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      {CATEGORY_OPTIONS.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority (1-100)</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={editingKnowledge.priority || 50}
                      onChange={(e) => setEditingKnowledge({...editingKnowledge, priority: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input
                    type="text"
                    value={editingKnowledge.title || ''}
                    onChange={(e) => setEditingKnowledge({...editingKnowledge, title: e.target.value})}
                    placeholder="e.g., How to file a claim"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Question (Optional)</label>
                  <input
                    type="text"
                    value={editingKnowledge.question || ''}
                    onChange={(e) => setEditingKnowledge({...editingKnowledge, question: e.target.value})}
                    placeholder="e.g., How do I file a claim?"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Answer / Content *</label>
                  <textarea
                    rows={4}
                    value={editingKnowledge.answer || editingKnowledge.content || ''}
                    onChange={(e) => setEditingKnowledge({
                      ...editingKnowledge, 
                      answer: e.target.value,
                      content: e.target.value
                    })}
                    placeholder="The answer the chatbot should provide..."
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editingKnowledge.is_global ?? true}
                    onChange={(e) => setEditingKnowledge({...editingKnowledge, is_global: e.target.checked})}
                    className="rounded text-indigo-600"
                  />
                  <span className="text-sm text-gray-700">Make this available to all tenants (Global)</span>
                </label>
              </div>

              <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
                <button
                  onClick={() => setShowKnowledgeForm(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={saveKnowledge}
                  disabled={!editingKnowledge.title || !editingKnowledge.content}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  Save Entry
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <AdminFooter />
    </div>
  );
}
