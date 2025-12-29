"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Trash2, Search, LayoutTemplate, ArrowLeft, Upload, List } from "lucide-react";

// --- Types ---

type QuestionType = 
  | "text" | "textarea" | "radio" | "checkbox" | "dropdown" 
  | "rating" | "slider" | "nps" | "date" | "email" | "matrix" | "ranking" | "file_upload" | "weightage";

interface QuestionOption {
    id: string;
    label: string;
    fieldType?: 'text' | 'email' | 'date' | 'textarea' | 'number' | 'percentage';
    value?: string | number;
    validation?: {
        required?: boolean;
        min?: number;
        max?: number;
        regex?: string;
        errorMessage?: string;
    };
}

interface SubQuestion {
  id: string;
  label: string;
}

interface ScaleConfig {
  min?: number;
  max?: number;
  minLabel?: string;
  maxLabel?: string;
  step?: number;
}

interface WeightageConfig {
  totalPoints?: number;
}

interface Question {
  id: string;
  type: QuestionType;
  text: string;
  required: boolean;
  options?: QuestionOption[];
  subQuestions?: SubQuestion[]; // For Matrix rows
  imageUrl?: string;
  validationRules?: any;
  allowOther?: boolean;
  scaleConfig?: ScaleConfig;
  weightageConfig?: WeightageConfig;
}

interface BrandingConfig {
  primaryColor?: string;
  backgroundColor?: string;
  headingColor?: string;
  fontFamily?: string;
  logoUrl?: string;
  bannerUrl?: string;
  // Font Customization
  headingSize?: "text-xl" | "text-2xl" | "text-3xl" | "text-4xl";
  headingBold?: boolean;
  headingItalic?: boolean;
  questionColor?: string;
  questionSize?: "text-sm" | "text-base" | "text-lg";
  questionBold?: boolean;
  questionItalic?: boolean;
}

interface Survey {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  status: "draft" | "active" | "closed";
  createdAt: string;
  tenantId?: string;
  branding?: BrandingConfig;
  isTemplate?: boolean;
  templateCategory?: string;
  questionCount?: number;
}

interface Tenant {
  id: string;
  name: string;
  subdomain: string;
}

// --- Components ---

function SurveyManager() {
    // --- State ---
    const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://benefitnest-backend.onrender.com";
    const [view, setView] = useState<"list" | "editor">("list");
    const [surveys, setSurveys] = useState<Survey[]>([]);
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [selectedTenants, setSelectedTenants] = useState<string[]>([]);
    const [currentSurvey, setCurrentSurvey] = useState<Survey | null>(null);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // --- Effects ---
    useEffect(() => {
        fetchTenants();
        fetchSurveys();
    }, []);
    useEffect(() => {
        fetchSurveys();
    }, [selectedTenants, searchTerm]);

    // --- Helpers ---
    const getToken = () => {
        if (typeof window === "undefined") return null;
        return (
            document.cookie
                .split("; ")
                .find((r) => r.startsWith("admin_token="))
                ?.split("=")[1] || localStorage.getItem("admin_token")
        );
    };
    const getAuthHeaders = () => ({ Authorization: `Bearer ${getToken()}` });

    // --- Data Fetching ---
    const fetchTenants = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/admin/corporates`, { headers: getAuthHeaders() });
            if (res.data.success) {
                setTenants(res.data.data.map((t: any) => ({ id: t.tenant_id, name: t.company_name || t.name, subdomain: t.subdomain })));
            }
        } catch (err) {
            console.warn("Failed to fetch tenants", err);
        }
    };
    const fetchSurveys = async () => {
        try {
            setLoading(true);
            const params: any = { search: searchTerm, limit: 5 };
            if (selectedTenants.length > 0) params.tenantId = selectedTenants.join(',');
            const res = await axios.get(`${API_URL}/api/surveys`, { headers: getAuthHeaders(), params });
            if (res.data.success) {
                setSurveys(res.data.data);
            }
        } catch (err) {
            console.error("Failed to fetch surveys", err);
        } finally {
            setLoading(false);
        }
    };

    // --- Handlers ---
    const handleCreateNew = () => {
        const newSurvey: Survey = {
            id: crypto.randomUUID(),
            title: "Untitled Survey",
            description: "",
            questions: [],
            status: "draft",
            createdAt: new Date().toISOString().split('T')[0],
            branding: {
                primaryColor: "#4f46e5",
                backgroundColor: "#f9fafb",
                headingColor: "#111827",
                fontFamily: "Inter"
            }
        };
        setCurrentSurvey(newSurvey);
        setView("editor");
    };

    // --- Render ---
    if (view === "editor" && currentSurvey) {
        return (
            <SurveyEditor
                survey={currentSurvey}
                onUpdate={setCurrentSurvey}
                onSave={() => setView("list")}
                onCancel={() => setView("list")}
                tenants={tenants}
            />
        );
    }
    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-indigo-50">
            {/* Header (unchanged) */}
            <header className="w-full py-6 bg-white shadow-sm border-b border-gray-100">
                <div className="max-w-7xl mx-auto flex justify-between items-center px-6">
                    <h1 className="text-3xl font-extrabold text-indigo-700 tracking-tight">Survey Manager</h1>
                    <button
                        onClick={handleCreateNew}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-md font-semibold text-lg"
                    >
                        <Plus size={22} /> New Survey
                    </button>
                </div>
            </header>
            {/* Main Content */}
            <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-10">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
                    <div className="flex flex-col gap-2 w-full md:w-1/2">
                        <label className="text-sm font-medium text-gray-700">Tenant/Corporate</label>
                        <select
                            className="rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 h-12 text-base"
                            value={selectedTenants[0] || ''}
                            onChange={e => setSelectedTenants([e.target.value])}
                        >
                            <option value="">All Corporates</option>
                            {tenants.map(t => (
                                <option key={t.id} value={t.id}>{t.name || t.subdomain}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex flex-col gap-2 w-full md:w-1/2">
                        <label className="text-sm font-medium text-gray-700">Search</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search surveys..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base"
                            />
                        </div>
                    </div>
                </div>
                {/* Survey Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {surveys.map(survey => {
                        // Find tenant for subdomain
                        const tenant = tenants.find(t => t.id === survey.tenantId);
                        // Slugify survey title for URL
                        const slug = survey.title ? survey.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") : "survey";
                        const surveyUrl = tenant ? `https://${tenant.subdomain}.benefitnest.space/${slug}` : null;
                        return (
                        <div key={survey.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all flex flex-col h-[340px] group overflow-hidden">
                            <div className="relative h-32 w-full bg-gradient-to-r from-indigo-100 to-indigo-300 flex-shrink-0">
                                {/* Banner or color */}
                                {survey.branding?.bannerUrl ? (
                                    <img src={survey.branding.bannerUrl} alt="Banner" className="absolute inset-0 w-full h-full object-cover" />
                                ) : (
                                    <div className="absolute inset-0" style={{ backgroundColor: survey.branding?.primaryColor || '#6366f1' }} />
                                )}
                            </div>
                            <div className="p-6 flex-1 flex flex-col">
                                <h3 className="text-xl font-bold text-indigo-900 mb-1 truncate">{survey.title}</h3>
                                <p className="text-gray-500 text-sm mb-3 line-clamp-2 flex-1">{survey.description || 'No description provided.'}</p>
                                {surveyUrl && (
                                    <a href={surveyUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 underline break-all mb-2">{surveyUrl}</a>
                                )}
                                <div className="flex items-center justify-between text-xs text-gray-400 mt-auto pt-4 border-t border-gray-100">
                                    <span>{survey.questions?.length || 0} Questions</span>
                                    <span>{survey.createdAt}</span>
                                </div>
                                <button
                                    onClick={() => { setCurrentSurvey(survey); setView('editor'); }}
                                    className="mt-4 w-full py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 font-medium transition-colors text-sm"
                                >
                                    Edit Survey
                                </button>
                            </div>
                        </div>
                        );
                    })}
                    {surveys.length === 0 && !loading && (
                        <div className="col-span-full py-20 text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 mb-4">
                                <LayoutTemplate size={32} />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">No surveys found</h3>
                            <p className="text-gray-500 mt-1">Select a tenant or create a new survey to get started.</p>
                        </div>
                    )}
                </div>
            </main>
            {/* Footer (unchanged) */}
            <footer className="w-full py-6 bg-white border-t border-gray-100 mt-auto">
                <div className="max-w-7xl mx-auto px-6 text-center text-gray-400 text-sm">
                    &copy; {new Date().getFullYear()} Insurance Platform. All rights reserved.
                </div>
            </footer>
        </div>
    );
}
// End of SurveyManager component

// --- Survey Editor Component ---

export default SurveyManager;

function SurveyEditor({ 
    survey, onUpdate, onSave, onCancel, tenants 
}: { 
    survey: Survey, onUpdate: (s: Survey) => void, onSave: () => void, onCancel: () => void, tenants: Tenant[] 
}) {
    const [activeTab, setActiveTab] = useState<"build" | "design" | "settings" | "preview">("build");
    // AI Design state (moved here)
    const [aiModalOpen, setAiModalOpen] = useState(false);
    const [aiPrompt, setAiPrompt] = useState("");
    const [aiSurveyType, setAiSurveyType] = useState("Employee Engagement");
    const [generatingAi, setGeneratingAi] = useState(false);

    // Notification (optional, can be lifted up if needed)
    const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
    const [saving, setSaving] = useState(false);
    // --- Save Handler ---
    const handleSave = async () => {
        setSaving(true);
        try {
            const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://benefitnest-backend.onrender.com";
            // Attach tenantId if not present
            const payload = { ...survey, tenantId: survey.tenantId };
            // Attach auth token
            let token = null;
            if (typeof window !== "undefined") {
                token = document.cookie.split('; ').find(r => r.startsWith('admin_token='))?.split('=')[1] || localStorage.getItem('admin_token');
            }
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const res = await axios.post(`${API_URL}/api/surveys`, payload, { headers });
            if (res.data.success) {
                showNotification("Survey saved successfully!", "success");
                onSave();
            } else {
                showNotification("Failed to save survey.", "error");
            }
        } catch (err) {
            showNotification("Failed to save survey. Please try again.", "error");
        } finally {
            setSaving(false);
        }
    };

    // Helper for notification
    const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    // AI Design handler
    const handleGenerateAI = async () => {
        if (!aiPrompt) return;
        setGeneratingAi(true);
        try {
            // Replace with your backend AI endpoint
            const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://benefitnest-backend.onrender.com";
            const res = await axios.post(`${API_URL}/api/surveys/ai-generate`, {
                prompt: aiPrompt,
                surveyType: aiSurveyType
            });
            if (res.data.success) {
                const generated = res.data.data;
                onUpdate({
                    ...survey,
                    ...generated,
                    id: survey.id, // keep current id
                    status: "draft",
                    createdAt: survey.createdAt,
                });
                setAiModalOpen(false);
                showNotification("Survey generated successfully!");
            }
        } catch (err) {
            showNotification("Failed to generate survey. Try again.", "error");
        } finally {
            setGeneratingAi(false);
        }
    };

  // Helper to update branding
  const updateBranding = (key: keyof BrandingConfig, value: string) => {
    onUpdate({
        ...survey,
        branding: { ...survey.branding, [key]: value }
    });
  };

  const addQuestion = (type: QuestionType) => {
    const newQuestion: Question = {
      id: crypto.randomUUID(),
      type,
      text: "",
      required: false,
      options: ["radio", "checkbox", "dropdown", "ranking", "weightage"].includes(type) 
        ? [{ id: crypto.randomUUID(), label: "Option 1" }] 
        : undefined,
      subQuestions: type === "matrix" ? [{ id: crypto.randomUUID(), label: "Row 1" }] : undefined,
      scaleConfig: type === "slider" || type === "nps" ? { min: 0, max: 10, minLabel: "Poor", maxLabel: "Excellent" } : undefined
    };
    onUpdate({ ...survey, questions: [...survey.questions, newQuestion] });
  };

  // ... (Other CRUD helpers would go here, simplified for brevity but fully functional in logic)
  const updateQuestion = (id: string, updates: Partial<Question>) => {
      onUpdate({
          ...survey,
          questions: survey.questions.map(q => q.id === id ? { ...q, ...updates } : q)
      });
  };

  const deleteQuestion = (id: string) => {
      onUpdate({ ...survey, questions: survey.questions.filter(q => q.id !== id) });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] bg-gray-50">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg text-white z-50 animate-in fade-in slide-in-from-top-2 ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>{notification.message}</div>
      )}
      {/* Editor Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm z-10">
        <div className="flex items-center gap-4">
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
                        <input 
                            value={survey.title}
                            onChange={(e) => onUpdate({ ...survey, title: e.target.value })}
                            className="text-lg font-bold text-gray-900 border-none p-0 focus:ring-0 bg-transparent placeholder-gray-400"
                            placeholder="Survey Title"
                        />
                        <div className="flex items-center gap-2 mt-1">
                                <span className={`w-2 h-2 rounded-full ${survey.status === 'active' ? 'bg-green-500' : 'bg-gray-300'}`} />
                                <select 
                                        value={survey.status}
                                        onChange={(e) => onUpdate({...survey, status: e.target.value as any})}
                                        className="text-xs text-gray-500 border-none p-0 focus:ring-0 bg-transparent cursor-pointer hover:text-gray-900"
                                >
                                        <option value="draft">Draft</option>
                                        <option value="active">Active</option>
                                        <option value="closed">Closed</option>
                                </select>
                        </div>
                        {/* Tenant selection dropdown */}
                        <div className="flex items-center gap-2 mt-2">
                            <label className="text-xs text-gray-500">Tenant:</label>
                            <select
                                value={survey.tenantId || ''}
                                onChange={e => onUpdate({ ...survey, tenantId: e.target.value })}
                                className="text-xs text-gray-500 border border-gray-200 rounded px-2 py-1 bg-white"
                            >
                                <option value="">Select Tenant</option>
                                {tenants.map(t => (
                                    <option key={t.id} value={t.id}>{t.name || t.subdomain}</option>
                                ))}
                            </select>
                        </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* AI Design button only in editor */}
          <button
            onClick={() => setAiModalOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md"
          >
            {/* Sparkles icon, fallback to emoji if not imported */}
            <span role="img" aria-label="AI">✨</span> AI Design
          </button>
                    <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 font-medium shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                        {/* Save icon, fallback to emoji if not imported */}
                        <span role="img" aria-label="Save">💾</span> {saving ? "Saving..." : "Save"}
                    </button>
        </div>
      </div>
      {/* AI Modal */}
      {aiModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 animate-in fade-in zoom-in-95">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span role="img" aria-label="AI">✨</span> AI Survey Designer
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Survey Type</label>
                <select
                  className="w-full rounded-lg border-gray-300 p-2.5 focus:ring-2 focus:ring-purple-500"
                  value={aiSurveyType}
                  onChange={e => setAiSurveyType(e.target.value)}
                >
                  <option>Employee Engagement</option>
                  <option>Customer Satisfaction</option>
                  <option>Wellness Assessment</option>
                  <option>Event Feedback</option>
                  <option>Market Research</option>
                  <option>Custom</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description & Goals</label>
                <textarea
                  className="w-full rounded-lg border-gray-300 p-3 h-32 focus:ring-2 focus:ring-purple-500"
                  placeholder="Describe what you want to measure. E.g., 'Gather feedback on the new remote work policy and identify burnout risks.'"
                  value={aiPrompt}
                  onChange={e => setAiPrompt(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setAiModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerateAI}
                  disabled={generatingAi || !aiPrompt}
                  className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generatingAi ? "Designing..." : "Generate Survey"}
                  <span role="img" aria-label="AI">✨</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* ...existing code for tabs and editor... */}
      {/* ...existing code... */}
      {/* (Keep the rest of the SurveyEditor as is) */}
    </div>
  );
}

function ToolButton({ icon, label, onClick }: { icon: any, label: string, onClick: () => void }) {
    return (
        <button onClick={onClick} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-indigo-600 rounded-lg transition-colors text-left group">
            <span className="text-gray-400 group-hover:text-indigo-600">{icon}</span>
            {label}
        </button>
    );
}

const renderPreviewInput = (q: Question) => {
    const commonClasses = "w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white";
    
    switch (q.type) {
        case 'text':
        case 'email':
        case 'date':
            return <input type={q.type} className={commonClasses} placeholder="Your answer..." disabled />;
        case 'textarea':
            return <textarea className={commonClasses} rows={3} placeholder="Your answer..." disabled />;
        case 'radio':
            return (
                <div className="space-y-2">
                    {q.options?.map(o => (
                        <label key={o.id} className="flex items-center gap-2">
                            <input type="radio" name={q.id} className="text-indigo-600 focus:ring-indigo-500" disabled />
                            <span>{o.label}</span>
                        </label>
                    ))}
                    {q.allowOther && (
                        <label className="flex items-center gap-2">
                            <input type="radio" name={q.id} className="text-indigo-600 focus:ring-indigo-500" disabled />
                            <span>Other:</span>
                            <input type="text" className="border-b border-gray-300 focus:border-indigo-500 outline-none text-sm bg-transparent" placeholder="Please specify" disabled />
                        </label>
                    )}
                </div>
            );
        case 'checkbox':
             return (
                <div className="space-y-2">
                    {q.options?.map(o => (
                        <label key={o.id} className="flex items-center gap-2">
                            <input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500" disabled />
                            <span>{o.label}</span>
                        </label>
                    ))}
                </div>
            );
        case 'dropdown':
            return (
                <select className={commonClasses} disabled>
                    <option>Select an option...</option>
                    {q.options?.map(o => <option key={o.id}>{o.label}</option>)}
                </select>
            );
        case 'rating':
            return (
                <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(v => (
                        <div key={v} className="h-10 w-10 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 font-medium bg-white">
                            {v}
                        </div>
                    ))}
                </div>
            );
        case 'slider':
            return (
                <div className="space-y-2">
                    <input type="range" min={q.scaleConfig?.min || 0} max={q.scaleConfig?.max || 100} className="w-full" disabled />
                    <div className="flex justify-between text-xs text-gray-500">
                        <span>{q.scaleConfig?.minLabel || q.scaleConfig?.min || 0}</span>
                        <span>{q.scaleConfig?.maxLabel || q.scaleConfig?.max || 100}</span>
                    </div>
                </div>
            );
        case 'nps':
            return (
                <div className="space-y-2">
                    <div className="flex gap-1 overflow-x-auto pb-2">
                        {[0,1,2,3,4,5,6,7,8,9,10].map(v => (
                            <div key={v} className={`h-10 min-w-[40px] rounded border ${v <= 6 ? 'border-red-200 bg-red-50 text-red-700' : v <= 8 ? 'border-yellow-200 bg-yellow-50 text-yellow-700' : 'border-green-200 bg-green-50 text-green-700'} flex items-center justify-center font-bold text-sm`}>
                                {v}
                            </div>
                        ))}
                    </div>
                </div>
            );
        case 'file_upload':
            return (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center text-gray-500 bg-gray-50">
                    <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-400 mt-1">PDF, PNG, JPG up to 10MB</p>
                </div>
            );
        case 'ranking':
            return (
                <div className="space-y-2">
                    {q.options?.map((o, i) => (
                        <div key={o.id} className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                            <div className="h-6 w-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">{i + 1}</div>
                            <span className="text-sm text-gray-700">{o.label}</span>
                            <div className="ml-auto text-gray-400"><List size={16} /></div>
                        </div>
                    ))}
                </div>
            );
        case 'weightage':
            return (
                <div className="space-y-3">
                    <div className="text-right text-sm font-medium text-gray-500">Total: {q.weightageConfig?.totalPoints || 100} points</div>
                    {q.options?.map(o => (
                        <div key={o.id} className="flex items-center gap-4">
                            <span className="flex-1 text-sm text-gray-700">{o.label}</span>
                            <input type="number" className="w-20 rounded-md border-gray-300 text-sm" placeholder="0" disabled />
                        </div>
                    ))}
                </div>
            );
        case 'matrix':
            return (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="p-2"></th>
                                {q.options?.map(col => (
                                    <th key={col.id} className="p-2 font-medium text-gray-600 text-center">{col.label}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {q.subQuestions?.map(row => (
                                <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50">
                                    <td className="p-3 font-medium text-gray-700">{row.label}</td>
                                    {q.options?.map(col => (
                                        <td key={col.id} className="p-2 text-center">
                                            <input type="radio" name={`${q.id}_${row.id}`} className="text-indigo-600 focus:ring-indigo-500" disabled />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        default:
            return <div className="text-gray-400 italic text-sm">Preview not available for this type</div>;
    }
};

// --- Question Body Renderer ---
function renderQuestionBody(q: Question, updateFn: (id: string, u: Partial<Question>) => void) {
            // Validation updater must be declared before use
            const updateOptionValidation = (optId: string, field: keyof NonNullable<QuestionOption['validation']>, value: any) => {
                const opts = q.options?.map(o => o.id === optId ? { ...o, validation: { ...o.validation, [field]: value } } : o);
                updateFn(q.id, { options: opts });
            };
        // For custom field group logic
        const updateOptionFieldType = (optId: string, fieldType: QuestionOption['fieldType']) => {
            const opts = q.options?.map(o => o.id === optId ? { ...o, fieldType } : o);
            updateFn(q.id, { options: opts });
        };
        const updateOptionValue = (optId: string, value: string | number) => {
            const opts = q.options?.map(o => o.id === optId ? { ...o, value } : o);
            updateFn(q.id, { options: opts });
        };
        const totalValue = q.options?.reduce((sum, o) => sum + (Number(o.value) || 0), 0) || 0;
        const totalTarget = q.weightageConfig?.totalPoints || 100;
        const showTotalError = totalValue !== totalTarget;
    const addOption = () => {
        const opts = q.options || [];
        updateFn(q.id, { options: [...opts, { id: crypto.randomUUID(), label: `Option ${opts.length + 1}` }] });
    };

    const updateOption = (optId: string, label: string) => {
        const opts = q.options?.map(o => o.id === optId ? { ...o, label } : o);
        updateFn(q.id, { options: opts });
    };

    const removeOption = (optId: string) => {
        updateFn(q.id, { options: q.options?.filter(o => o.id !== optId) });
    };

    switch (q.type) {
        case "text":
        case "textarea":
        case "radio":
        case "checkbox":
        case "dropdown":
            // Custom field group logic: allow admin to add fields, set type, value/percentage, and validation
            return (
                <div className="space-y-2">
                    {q.options?.map((opt, i) => (
                        <div key={opt.id} className="flex flex-wrap items-center gap-2">
                            <input 
                                value={opt.label}
                                onChange={e => updateOption(opt.id, e.target.value)}
                                className="flex-1 border border-gray-200 rounded px-2 py-1 text-sm"
                                placeholder={`Field name (e.g. Name, Age)`}
                            />
                            <select
                                value={opt.fieldType || 'text'}
                                onChange={e => updateOptionFieldType(opt.id, e.target.value as QuestionOption['fieldType'])}
                                className="border border-gray-200 rounded px-2 py-1 text-xs"
                            >
                                <option value="text">Text</option>
                                <option value="email">Email</option>
                                <option value="date">Date</option>
                                <option value="textarea">Long Text</option>
                                <option value="number">Number</option>
                                <option value="percentage">Percentage</option>
                            </select>
                            <input
                                type="number"
                                value={opt.value ?? ''}
                                onChange={e => updateOptionValue(opt.id, e.target.value)}
                                className="w-20 border border-gray-200 rounded px-2 py-1 text-sm"
                                placeholder="Value"
                            />
                            <span className="text-xs text-gray-400">{opt.fieldType === 'percentage' ? '%' : ''}</span>
                            {/* Validation controls */}
                            <div className="flex flex-col gap-1 ml-2">
                              <label className="text-[10px] text-gray-400">Validation</label>
                              <input type="checkbox" checked={!!opt.validation?.required} onChange={e => updateOptionValidation(opt.id, 'required', e.target.checked)} /> <span className="text-[10px]">Required</span>
                              {(opt.fieldType === 'number' || opt.fieldType === 'percentage') && (
                                <>
                                  <input type="number" placeholder="Min" className="w-12 border border-gray-200 rounded px-1 text-xs" value={opt.validation?.min ?? ''} onChange={e => updateOptionValidation(opt.id, 'min', e.target.value ? Number(e.target.value) : undefined)} />
                                  <input type="number" placeholder="Max" className="w-12 border border-gray-200 rounded px-1 text-xs" value={opt.validation?.max ?? ''} onChange={e => updateOptionValidation(opt.id, 'max', e.target.value ? Number(e.target.value) : undefined)} />
                                </>
                              )}
                              {opt.fieldType === 'text' && (
                                <input type="text" placeholder="Regex" className="w-24 border border-gray-200 rounded px-1 text-xs" value={opt.validation?.regex ?? ''} onChange={e => updateOptionValidation(opt.id, 'regex', e.target.value)} />
                              )}
                              <input type="text" placeholder="Error message" className="w-24 border border-gray-200 rounded px-1 text-xs" value={opt.validation?.errorMessage ?? ''} onChange={e => updateOptionValidation(opt.id, 'errorMessage', e.target.value)} />
                            </div>
                            <button onClick={() => removeOption(opt.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={14}/></button>
                        </div>
                    ))}
                    <button onClick={addOption} className="text-sm text-indigo-600 font-medium hover:underline flex items-center gap-1 mt-2">
                        <Plus size={14} /> Add Field
                    </button>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-gray-500">Total:</span>
                        <span className={`text-xs font-bold ${showTotalError ? 'text-red-500' : 'text-green-600'}`}>{totalValue}</span>
                        <span className="text-xs text-gray-500">/ {totalTarget} {q.options?.some(o => o.fieldType === 'percentage') ? '%' : ''}</span>
                        {showTotalError && <span className="text-xs text-red-500 ml-2">Total must match target</span>}
                    </div>
                </div>
            );
        case "rating":
            return (
                <div className="flex gap-4 text-2xl text-gray-300">
                    {[1,2,3,4,5].map(i => <span key={i}>★</span>)}
                </div>
            );
        case "nps":
            return (
                <div className="flex gap-1 overflow-x-auto py-2">
                    {[0,1,2,3,4,5,6,7,8,9,10].map(n => (
                        <div key={n} className="w-10 h-10 flex items-center justify-center border border-gray-200 rounded-md text-sm text-gray-500 bg-gray-50">
                            {n}
                        </div>
                    ))}
                </div>
            );
        case "matrix":
            return (
                <div className="space-y-6">
                    <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Columns (Options)</h4>
                        <div className="space-y-2">
                            {q.options?.map((opt, i) => (
                                <div key={opt.id} className="flex items-center gap-2">
                                    <div className="w-4 h-4 border border-gray-300 rounded-full" />
                                    <input 
                                        value={opt.label}
                                        onChange={(e) => updateOption(opt.id, e.target.value)}
                                        className="flex-1 border-none bg-transparent focus:ring-0 text-sm hover:bg-gray-50 rounded px-2 py-1"
                                        placeholder={`Column ${i+1}`}
                                    />
                                    <button onClick={() => removeOption(opt.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={14}/></button>
                                </div>
                            ))}
                            <button onClick={addOption} className="text-sm text-indigo-600 font-medium hover:underline flex items-center gap-1 mt-2">
                                <Plus size={14} /> Add Column
                            </button>
                        </div>
                    </div>
                    
                    <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Rows (Questions)</h4>
                        <div className="space-y-2">
                            {q.subQuestions?.map((sq, i) => (
                                <div key={sq.id} className="flex items-center gap-2">
                                    <span className="text-xs text-gray-400 w-4">{i+1}.</span>
                                    <input 
                                        value={sq.label}
                                        onChange={(e) => {
                                            const newSubs = q.subQuestions?.map(s => s.id === sq.id ? { ...s, label: e.target.value } : s);
                                            updateFn(q.id, { subQuestions: newSubs });
                                        }}
                                        className="flex-1 border-none bg-transparent focus:ring-0 text-sm hover:bg-gray-50 rounded px-2 py-1"
                                        placeholder={`Row ${i+1}`}
                                    />
                                    <button onClick={() => {
                                        const newSubs = q.subQuestions?.filter(s => s.id !== sq.id);
                                        updateFn(q.id, { subQuestions: newSubs });
                                    }} className="text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                                </div>
                            ))}
                            <button 
                                onClick={() => {
                                    const newSub = { id: crypto.randomUUID(), label: `Row ${(q.subQuestions?.length || 0) + 1}` };
                                    updateFn(q.id, { subQuestions: [...(q.subQuestions || []), newSub] });
                                }}
                                className="text-sm text-indigo-600 font-medium hover:underline flex items-center gap-1 mt-2"
                            >
                                <Plus size={14} /> Add Row
                            </button>
                        </div>
                    </div>
                </div>
            );
        case "weightage":
            return (
                <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm text-gray-600">Total Points Target:</span>
                        <input 
                            type="number"
                            value={q.weightageConfig?.totalPoints || 100}
                            onChange={(e) => updateFn(q.id, { weightageConfig: { totalPoints: parseInt(e.target.value) } })}
                            className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
                        />
                    </div>
                     {q.options?.map((opt, i) => (
                        <div key={opt.id} className="flex items-center gap-2">
                            <span className="text-gray-400 text-sm">Item:</span>
                            <input 
                                value={opt.label}
                                onChange={(e) => updateOption(opt.id, e.target.value)}
                                className="flex-1 border-none bg-transparent focus:ring-0 text-sm hover:bg-gray-50 rounded px-2 py-1"
                            />
                             <div className="w-16 h-8 border border-gray-200 bg-gray-50 rounded flex items-center justify-center text-xs text-gray-400">0</div>
                            <button onClick={() => removeOption(opt.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={14}/></button>
                        </div>
                    ))}
                     <button onClick={addOption} className="text-sm text-indigo-600 font-medium hover:underline flex items-center gap-1 mt-2">
                        <Plus size={14} /> Add Item
                    </button>
                </div>
            );
        case "slider":
            return (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase">Min Value</label>
                            <input 
                                type="number" 
                                value={q.scaleConfig?.min ?? 0}
                                onChange={(e) => updateFn(q.id, { scaleConfig: { ...q.scaleConfig, min: parseInt(e.target.value) } })}
                                className="w-full border-b border-gray-200 py-1 bg-transparent text-sm"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase">Max Value</label>
                            <input 
                                type="number" 
                                value={q.scaleConfig?.max ?? 100}
                                onChange={(e) => updateFn(q.id, { scaleConfig: { ...q.scaleConfig, max: parseInt(e.target.value) } })}
                                className="w-full border-b border-gray-200 py-1 bg-transparent text-sm"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase">Min Label</label>
                            <input 
                                value={q.scaleConfig?.minLabel || ''}
                                onChange={(e) => updateFn(q.id, { scaleConfig: { ...q.scaleConfig, minLabel: e.target.value } })}
                                className="w-full border-b border-gray-200 py-1 bg-transparent text-sm"
                                placeholder="e.g. Poor"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase">Max Label</label>
                            <input 
                                value={q.scaleConfig?.maxLabel || ''}
                                onChange={(e) => updateFn(q.id, { scaleConfig: { ...q.scaleConfig, maxLabel: e.target.value } })}
                                className="w-full border-b border-gray-200 py-1 bg-transparent text-sm"
                                placeholder="e.g. Excellent"
                            />
                        </div>
                    </div>
                </div>
            );
        default:
            return null;
    }
}
