"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  Plus, Trash2, Save, Link as LinkIcon, Eye, MoreVertical, ArrowLeft,
  Image as ImageIcon, CheckSquare, Type, List, AlignLeft, ChevronDown,
  Copy, Search, Sparkles, LayoutTemplate, Palette, Settings, GripVertical, Upload, FileText
} from "lucide-react";

// --- Types ---

type QuestionType = 
  | "text" | "textarea" | "radio" | "checkbox" | "dropdown" 
  | "rating" | "slider" | "nps" | "date" | "email" | "matrix" | "ranking" | "file_upload" | "weightage";

interface QuestionOption {
  id: string;
  label: string;
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

export default function SurveyManager() {
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://benefitnest-backend.onrender.com";
  
  // State
  const [view, setView] = useState<"list" | "editor">("list");
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedTenants, setSelectedTenants] = useState<string[]>([]);
  const [currentSurvey, setCurrentSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiSurveyType, setAiSurveyType] = useState("Employee Engagement");
  const [generatingAi, setGeneratingAi] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  
  // Template State
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templates, setTemplates] = useState<Survey[]>([]);

  // Initial Fetch
  useEffect(() => {
    fetchTenants();
    fetchSurveys();
  }, []);

  useEffect(() => {
    fetchSurveys();
  }, [selectedTenants, searchTerm, statusFilter]);

  const getAuthHeaders = () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchTenants = async () => {
    try {
      // Use existing endpoint or fallback
      // Assuming /api/admin/corporates returns list
      // If strictly strict on routes, we might need to adjust, but let's try
      // Or use GraphQL if we had client here, but let's stick to REST for now if available
      // If not available, we'll mock or user needs to ensure endpoint exists. 
      // Based on previous context, /api/admin/corporates exists.
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
      const params: any = { search: searchTerm, limit: 5, status: statusFilter };
      if (selectedTenants.length > 0) params.tenantId = selectedTenants.join(',');
      
      const res = await axios.get(`${API_URL}/api/surveys`, { 
        headers: getAuthHeaders(),
        params
      });
      if (res.data.success) {
        setSurveys(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch surveys", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
        const res = await axios.get(`${API_URL}/api/surveys`, { 
            headers: getAuthHeaders(),
            params: { type: 'template' }
        });
        if (res.data.success) {
            setTemplates(res.data.data);
            setShowTemplateModal(true);
        }
    } catch (err) {
        console.error("Failed to fetch templates", err);
        showNotification("Failed to load templates", "error");
    }
  };

  const handleUseTemplate = (template: Survey) => {
    const newSurvey: Survey = {
        ...template,
        id: crypto.randomUUID(),
        title: `Copy of ${template.title}`,
        status: 'draft',
        createdAt: new Date().toISOString().split('T')[0],
        isTemplate: false,
        tenantId: selectedTenants.length > 0 ? selectedTenants[0] : undefined
    };
    setCurrentSurvey(newSurvey);
    setShowTemplateModal(false);
    setView("editor");
  };

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

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

  const handleGenerateAI = async () => {
    if (!aiPrompt) return;
    setGeneratingAi(true);
    try {
      const res = await axios.post(`${API_URL}/api/surveys/ai-generate`, {
        prompt: aiPrompt,
        surveyType: aiSurveyType
      }, { headers: getAuthHeaders() });

      if (res.data.success) {
        const generated = res.data.data;
        const newSurvey: Survey = {
            ...generated,
            id: crypto.randomUUID(),
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
        setAiModalOpen(false);
        setView("editor");
        showNotification("Survey generated successfully!");
      }
    } catch (err) {
      console.error(err);
      showNotification("Failed to generate survey. Try again.", "error");
    } finally {
      setGeneratingAi(false);
    }
  };

  const handleSave = async (survey: Survey) => {
    try {
      const payload = {
        ...survey,
        tenantId: selectedTenants.length === 1 ? selectedTenants[0] : null // Assign to first selected or null (global/template)
      };
      const res = await axios.post(`${API_URL}/api/surveys`, payload, { headers: getAuthHeaders() });
      if (res.data.success) {
        showNotification("Survey saved successfully!");
        fetchSurveys();
        setView("list");
      }
    } catch (err) {
      console.error(err);
      showNotification("Failed to save survey", "error");
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this survey?")) return;
    try {
        await axios.delete(`${API_URL}/api/surveys/${id}`, { headers: getAuthHeaders() });
        showNotification("Survey deleted");
        fetchSurveys();
    } catch (err) {
        console.error(err);
        showNotification("Failed to delete survey", "error");
    }
  };

  const generateUrl = (id: string) => {
    if (typeof window !== 'undefined') {
        return `${window.location.origin}/surveys/${id}`;
    }
    return `https://benefitnest.space/surveys/${id}`;
  };

  if (view === "editor" && currentSurvey) {
    return (
      <SurveyEditor 
        survey={currentSurvey} 
        onUpdate={setCurrentSurvey} 
        onSave={() => handleSave(currentSurvey)}
        onCancel={() => setView("list")}
      />
    );
  }

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto p-6">
      {/* Notifications */}
      {notification && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg text-white ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'} z-50 animate-in fade-in slide-in-from-top-2`}>
            {notification.message}
        </div>
      )}

      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage and track your client Survey</h1>
          <p className="text-gray-500 mt-1">Design world-class surveys with AI assistance</p>
        </div>
        
        <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
          {/* Client Selection */}
          <div className="relative min-w-[250px]">
             <select 
               multiple
               className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 h-10"
               value={selectedTenants}
               onChange={(e) => {
                 const options = Array.from(e.target.selectedOptions, option => option.value);
                 setSelectedTenants(options);
               }}
             >
               {tenants.map(t => (
                 <option key={t.id} value={t.id}>{t.name}</option>
               ))}
             </select>
             <p className="text-xs text-gray-400 mt-1">Hold Ctrl/Cmd to select multiple</p>
          </div>

          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search surveys..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 h-10"
          >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="closed">Closed</option>
          </select>

          <div className="flex gap-3">
            <button
              onClick={fetchTemplates}
              className="flex items-center gap-2 bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
            >
              <LayoutTemplate size={18} />
              Templates
            </button>
            <button
              onClick={() => setAiModalOpen(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md"
            >
              <Sparkles size={18} />
              AI Design
            </button>
            <button
              onClick={handleCreateNew}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <Plus size={18} />
              Create New
            </button>
          </div>
        </div>
      </div>

      {/* Survey Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {surveys.map(survey => (
          <div key={survey.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all overflow-hidden group flex flex-col h-[320px]">
              {/* Card Header with Banner/Color */}
              <div className="relative h-32 w-full bg-gray-100 flex-shrink-0">
                  {survey.branding?.bannerUrl ? (
                      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${survey.branding.bannerUrl})` }} />
                  ) : (
                      <div className="absolute inset-0" style={{ backgroundColor: survey.branding?.primaryColor || '#4f46e5' }} />
                  )}
                  
                  {/* Logo Overlay */}
                  {survey.branding?.logoUrl && (
                      <div className="absolute -bottom-6 left-6 h-12 w-12 bg-white rounded-lg shadow-md flex items-center justify-center p-1 border border-gray-100">
                          <img src={survey.branding.logoUrl} alt="Logo" className="max-h-full max-w-full object-contain" />
                      </div>
                  )}

                  {/* Actions Overlay */}
                  <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                          onClick={(e) => handleDelete(survey.id, e)}
                          className="p-1.5 bg-white/90 hover:bg-red-50 text-gray-500 hover:text-red-600 rounded-lg shadow-sm backdrop-blur-sm transition-colors"
                          title="Delete Survey"
                      >
                          <Trash2 size={16} />
                      </button>
                  </div>
                  
                  {/* Template Badge */}
                  {survey.isTemplate && (
                      <span className="absolute top-2 left-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium shadow-sm border border-yellow-200">
                          Template
                      </span>
                  )}
              </div>

              <div className="p-6 pt-8 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1" style={{ color: survey.branding?.headingColor }}>{survey.title}</h3>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-1">{survey.description || "No description provided."}</p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-400 mt-auto pt-4 border-t border-gray-100">
                      <span className="flex items-center gap-1">
                          <FileText size={14} />
                          {survey.questionCount || survey.questions?.length || 0} Questions
                      </span>
                      <span>{survey.createdAt}</span>
                  </div>

                  <button 
                      onClick={() => { setCurrentSurvey(survey); setView("editor"); }}
                      className="mt-4 w-full py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 font-medium transition-colors text-sm"
                  >
                      Edit Survey
                  </button>
              </div>
          </div>
        ))}
        
        {surveys.length === 0 && !loading && (
           <div className="col-span-full py-20 text-center">
             <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 mb-4">
               <LayoutTemplate size={32} />
             </div>
             <h3 className="text-lg font-medium text-gray-900">No surveys found</h3>
             <p className="text-gray-500 mt-1">Select a client or create a new survey to get started.</p>
           </div>
        )}
      </div>

      {/* AI Modal */}
      {aiModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 animate-in fade-in zoom-in-95">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Sparkles className="text-purple-600" />
              AI Survey Designer
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Survey Type</label>
                <select 
                  className="w-full rounded-lg border-gray-300 p-2.5 focus:ring-2 focus:ring-purple-500"
                  value={aiSurveyType}
                  onChange={(e) => setAiSurveyType(e.target.value)}
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
                  onChange={(e) => setAiPrompt(e.target.value)}
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
                  <Sparkles size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl w-full max-w-5xl max-h-[85vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95">
             <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Choose a Template</h2>
                    <p className="text-gray-500 text-sm">Start with a pre-designed survey and customize it.</p>
                </div>
                <button onClick={() => setShowTemplateModal(false)} className="text-gray-400 hover:text-gray-600 bg-white p-2 rounded-full shadow-sm hover:shadow"><Plus className="rotate-45" size={24} /></button>
             </div>
             <div className="p-8 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 bg-gray-50/50">
                {templates.length === 0 ? (
                    <div className="col-span-3 text-center py-16 text-gray-500 flex flex-col items-center">
                        <LayoutTemplate className="h-16 w-16 text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">No templates found</h3>
                        <p>Create a template or check back later.</p>
                    </div>
                ) : (
                    templates.map(t => (
                        <div key={t.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl hover:border-indigo-300 transition-all cursor-pointer group flex flex-col h-[300px]" onClick={() => handleUseTemplate(t)}>
                             <div className="h-32 bg-gray-100 relative overflow-hidden">
                                {t.branding?.bannerUrl ? (
                                    <div className="absolute inset-0 bg-cover bg-center transition-transform group-hover:scale-105 duration-500" style={{ backgroundImage: `url(${t.branding.bannerUrl})` }} />
                                ) : (
                                    <div className="absolute inset-0" style={{ backgroundColor: t.branding?.primaryColor || '#4f46e5' }} />
                                )}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                    <span className="bg-white text-indigo-600 px-4 py-2 rounded-full font-bold shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all">Use Template</span>
                                </div>
                             </div>
                             <div className="p-5 flex-1 flex flex-col">
                                <h3 className="font-bold text-gray-900 mb-2 text-lg line-clamp-1">{t.title}</h3>
                                <p className="text-sm text-gray-500 line-clamp-2 flex-1">{t.description || "No description."}</p>
                                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400">
                                    <span className="flex items-center gap-1"><FileText size={14}/> {t.questions?.length || 0} Questions</span>
                                    <span className="px-2 py-1 bg-gray-100 rounded text-gray-600">{t.templateCategory || "General"}</span>
                                </div>
                             </div>
                        </div>
                    ))
                )}
             </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Survey Editor Component ---

function SurveyEditor({ 
  survey, onUpdate, onSave, onCancel 
}: { 
  survey: Survey, onUpdate: (s: Survey) => void, onSave: () => void, onCancel: () => void 
}) {
  const [activeTab, setActiveTab] = useState<"build" | "design" | "settings" | "preview">("build");

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
          </div>
        </div>

        <div className="flex items-center gap-4">
            <div className="flex bg-gray-100 rounded-lg p-1">
                <button onClick={() => setActiveTab("build")} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'build' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}>Questions</button>
                <button onClick={() => setActiveTab("design")} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'design' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}>Design</button>
                <button onClick={() => setActiveTab("settings")} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'settings' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}>Settings</button>
                <button onClick={() => setActiveTab("preview")} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'preview' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}>Preview</button>
            </div>
            <button onClick={onSave} className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 font-medium shadow-sm transition-all">
                <Save size={18} /> Save
            </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Tools */}
        {activeTab === "build" && (
            <div className="w-72 bg-white border-r border-gray-200 overflow-y-auto p-4 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
                <div className="mb-6">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Basic Fields</h3>
                    <div className="space-y-2">
                        <ToolButton icon={<Type size={18} />} label="Short Text" onClick={() => addQuestion("text")} />
                        <ToolButton icon={<AlignLeft size={18} />} label="Long Text" onClick={() => addQuestion("textarea")} />
                        <ToolButton icon={<CheckSquare size={18} />} label="Multiple Choice" onClick={() => addQuestion("radio")} />
                        <ToolButton icon={<List size={18} />} label="Checkboxes" onClick={() => addQuestion("checkbox")} />
                        <ToolButton icon={<ChevronDown size={18} />} label="Dropdown" onClick={() => addQuestion("dropdown")} />
                    </div>
                </div>
                <div>
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Advanced Fields</h3>
                    <div className="space-y-2">
                        <ToolButton icon={<Settings size={18} />} label="Matrix / Grid" onClick={() => addQuestion("matrix")} />
                        <ToolButton icon={<LayoutTemplate size={18} />} label="Rating Scale" onClick={() => addQuestion("rating")} />
                        <ToolButton icon={<Sparkles size={18} />} label="NPS" onClick={() => addQuestion("nps")} />
                        <ToolButton icon={<Settings size={18} />} label="Slider" onClick={() => addQuestion("slider")} />
                        <ToolButton icon={<List size={18} />} label="Ranking" onClick={() => addQuestion("ranking")} />
                        <ToolButton icon={<Settings size={18} />} label="Weightage" onClick={() => addQuestion("weightage")} />
                        <ToolButton icon={<Settings size={18} />} label="Date / Time" onClick={() => addQuestion("date")} />
                        <ToolButton icon={<Upload size={18} />} label="File Upload" onClick={() => addQuestion("file_upload")} />
                    </div>
                </div>
            </div>
        )}

        {/* Design Sidebar */}
        {activeTab === "design" && (
             <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto p-6 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Branding & Style</h3>
                
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Logo URL</label>
                        <input 
                            type="text" 
                            value={survey.branding?.logoUrl || ''} 
                            onChange={(e) => updateBranding('logoUrl', e.target.value)}
                            className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 text-sm"
                            placeholder="https://..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Banner URL</label>
                        <input 
                            type="text" 
                            value={survey.branding?.bannerUrl || ''} 
                            onChange={(e) => updateBranding('bannerUrl', e.target.value)}
                            className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 text-sm"
                            placeholder="https://..."
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                            <div className="flex items-center gap-2">
                                <input 
                                    type="color" 
                                    value={survey.branding?.primaryColor || '#4f46e5'} 
                                    onChange={(e) => updateBranding('primaryColor', e.target.value)}
                                    className="h-8 w-8 rounded cursor-pointer border-none"
                                />
                                <span className="text-xs text-gray-500 uppercase">{survey.branding?.primaryColor}</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Bg Color</label>
                            <div className="flex items-center gap-2">
                                <input 
                                    type="color" 
                                    value={survey.branding?.backgroundColor || '#f9fafb'} 
                                    onChange={(e) => updateBranding('backgroundColor', e.target.value)}
                                    className="h-8 w-8 rounded cursor-pointer border-none"
                                />
                            </div>
                        </div>
                    </div>
                    <div>
                         <label className="block text-sm font-medium text-gray-700 mb-2">Heading Font</label>
                         <select 
                            value={survey.branding?.fontFamily || 'Inter'}
                            onChange={(e) => updateBranding('fontFamily', e.target.value)}
                            className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 text-sm"
                         >
                             <option value="Inter">Inter</option>
                             <option value="Roboto">Roboto</option>
                             <option value="Open Sans">Open Sans</option>
                             <option value="Lato">Lato</option>
                             <option value="Merriweather">Merriweather</option>
                         </select>
                    </div>

                    {/* Font Customization */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Heading Style</label>
                        <div className="grid grid-cols-2 gap-2 mb-3">
                             <div className="flex items-center gap-2 border border-gray-200 rounded p-2">
                                <input 
                                    type="checkbox" 
                                    checked={survey.branding?.headingBold ?? true} 
                                    onChange={(e) => onUpdate({ ...survey, branding: { ...survey.branding, headingBold: e.target.checked } })}
                                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <span className="text-sm text-gray-600 font-bold">Bold</span>
                             </div>
                             <div className="flex items-center gap-2 border border-gray-200 rounded p-2">
                                <input 
                                    type="checkbox" 
                                    checked={survey.branding?.headingItalic || false} 
                                    onChange={(e) => onUpdate({ ...survey, branding: { ...survey.branding, headingItalic: e.target.checked } })}
                                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <span className="text-sm text-gray-600 italic">Italic</span>
                             </div>
                        </div>
                        
                        <label className="block text-sm font-medium text-gray-700 mb-2">Heading Size</label>
                        <select 
                            value={survey.branding?.headingSize || 'text-3xl'}
                            onChange={(e) => updateBranding('headingSize', e.target.value)}
                            className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 text-sm mb-4"
                        >
                             <option value="text-xl">Small</option>
                             <option value="text-2xl">Medium</option>
                             <option value="text-3xl">Large</option>
                             <option value="text-4xl">Extra Large</option>
                        </select>

                        <label className="block text-sm font-medium text-gray-700 mb-2">Heading Color</label>
                        <div className="flex items-center gap-2 mb-4">
                            <input 
                                type="color" 
                                value={survey.branding?.headingColor || '#111827'} 
                                onChange={(e) => updateBranding('headingColor', e.target.value)}
                                className="h-8 w-8 rounded cursor-pointer border-none"
                            />
                            <span className="text-xs text-gray-500 uppercase">{survey.branding?.headingColor}</span>
                        </div>

                        <div className="border-t border-gray-100 my-4 pt-4">
                             <label className="block text-sm font-medium text-gray-700 mb-2">Question Style</label>
                             <div className="grid grid-cols-2 gap-2 mb-3">
                                 <div className="flex items-center gap-2 border border-gray-200 rounded p-2">
                                    <input 
                                        type="checkbox" 
                                        checked={survey.branding?.questionBold || false} 
                                        onChange={(e) => onUpdate({ ...survey, branding: { ...survey.branding, questionBold: e.target.checked } })}
                                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span className="text-sm text-gray-600 font-bold">Bold</span>
                                 </div>
                                 <div className="flex items-center gap-2 border border-gray-200 rounded p-2">
                                    <input 
                                        type="checkbox" 
                                        checked={survey.branding?.questionItalic || false} 
                                        onChange={(e) => onUpdate({ ...survey, branding: { ...survey.branding, questionItalic: e.target.checked } })}
                                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span className="text-sm text-gray-600 italic">Italic</span>
                                 </div>
                            </div>
                            
                            <label className="block text-sm font-medium text-gray-700 mb-2">Question Size</label>
                            <select 
                                value={survey.branding?.questionSize || 'text-base'}
                                onChange={(e) => updateBranding('questionSize', e.target.value)}
                                className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 text-sm mb-4"
                            >
                                 <option value="text-sm">Small</option>
                                 <option value="text-base">Medium</option>
                                 <option value="text-lg">Large</option>
                            </select>

                             <label className="block text-sm font-medium text-gray-700 mb-2">Question Color</label>
                            <div className="flex items-center gap-2">
                                <input 
                                    type="color" 
                                    value={survey.branding?.questionColor || '#374151'} 
                                    onChange={(e) => updateBranding('questionColor', e.target.value)}
                                    className="h-8 w-8 rounded cursor-pointer border-none"
                                />
                                <span className="text-xs text-gray-500 uppercase">{survey.branding?.questionColor}</span>
                            </div>
                        </div>
                    </div>
                </div>
             </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
             <div className="flex-1 overflow-y-auto bg-gray-50 p-8">
                <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Survey Settings</h2>
                    
                    <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg bg-gray-50">
                            <div>
                                <h3 className="font-medium text-gray-900">Save as Template</h3>
                                <p className="text-sm text-gray-500">Make this survey available as a starting point for others.</p>
                            </div>
                            <div className="flex items-center">
                                <input 
                                    type="checkbox" 
                                    checked={survey.isTemplate || false}
                                    onChange={(e) => onUpdate({ ...survey, isTemplate: e.target.checked })}
                                    className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                            </div>
                        </div>

                        {survey.isTemplate && (
                            <div className="animate-in fade-in slide-in-from-top-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Template Category</label>
                                <select 
                                    value={survey.templateCategory || ''}
                                    onChange={(e) => onUpdate({ ...survey, templateCategory: e.target.value })}
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500"
                                >
                                    <option value="">Select a category...</option>
                                    <option value="HR">HR & Employee Engagement</option>
                                    <option value="Customer Success">Customer Success</option>
                                    <option value="Marketing">Marketing & Research</option>
                                    <option value="Events">Events</option>
                                    <option value="Product">Product Feedback</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        )}
                        
                        <div className="pt-6 border-t border-gray-100">
                             <h3 className="font-medium text-gray-900 mb-4">Danger Zone</h3>
                             <button className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 text-sm font-medium">
                                 Delete Survey
                             </button>
                        </div>
                    </div>
                </div>
             </div>
        )}

        {/* Main Canvas (Build/Design) */}
        {(activeTab === "build" || activeTab === "design") && (
        <div className="flex-1 overflow-y-auto bg-gray-50 p-8">
            <div className="max-w-3xl mx-auto space-y-6">
                {/* Branding Preview Header */}
                {(survey.branding?.bannerUrl || survey.branding?.logoUrl) && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                        {survey.branding.bannerUrl && (
                            <img src={survey.branding.bannerUrl} alt="Banner" className="w-full h-40 object-cover" />
                        )}
                        {survey.branding.logoUrl && (
                            <div className="p-6 -mt-12">
                                <img src={survey.branding.logoUrl} alt="Logo" className="h-20 w-auto bg-white rounded-lg shadow-md p-2" />
                            </div>
                        )}
                    </div>
                )}

                {/* Survey Description Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 border-t-4" style={{ borderTopColor: survey.branding?.primaryColor || '#4f46e5' }}>
                     <input 
                        value={survey.title}
                        onChange={(e) => onUpdate({ ...survey, title: e.target.value })}
                        className={`w-full border-none p-0 focus:ring-0 mb-3 bg-transparent placeholder-gray-300 ${survey.branding?.headingSize || 'text-3xl'} ${survey.branding?.headingBold !== false ? 'font-bold' : 'font-normal'} ${survey.branding?.headingItalic ? 'italic' : ''}`}
                        style={{ color: survey.branding?.headingColor || '#111827', fontFamily: survey.branding?.fontFamily }}
                        placeholder="Survey Title"
                    />
                    <textarea 
                        value={survey.description}
                        onChange={(e) => onUpdate({ ...survey, description: e.target.value })}
                        className="w-full text-gray-600 border-none p-0 focus:ring-0 resize-none bg-transparent"
                        placeholder="Enter a description for your respondents..."
                        rows={2}
                    />
                </div>

                {/* Questions List */}
                {survey.questions.map((q, idx) => (
                    <div key={q.id} className="group relative bg-white rounded-xl shadow-sm border border-gray-200 hover:border-indigo-300 transition-all p-6">
                        {/* Actions */}
                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button onClick={() => deleteQuestion(q.id)} className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50"><Trash2 size={18} /></button>
                        </div>

                        <div className="flex gap-4">
                            <span className="text-gray-400 font-medium pt-2">{idx + 1}.</span>
                            <div className="flex-1 space-y-4">
                                <input 
                                    value={q.text}
                                    onChange={(e) => updateQuestion(q.id, { text: e.target.value })}
                                    className={`w-full border-none p-0 focus:ring-0 bg-transparent placeholder-gray-300 border-b border-transparent hover:border-gray-200 focus:border-indigo-500 transition-colors ${survey.branding?.questionSize || 'text-base'} ${survey.branding?.questionBold ? 'font-bold' : 'font-medium'} ${survey.branding?.questionItalic ? 'italic' : ''}`}
                                    style={{ color: survey.branding?.questionColor || '#374151', fontFamily: survey.branding?.fontFamily }}
                                    placeholder="Type your question here..."
                                />
                                
                                {/* Dynamic Editor based on Type */}
                                <div className="pl-0 pt-2">
                                    {renderQuestionBody(q, updateQuestion)}
                                </div>

                                <div className="pt-4 flex items-center gap-6 border-t border-gray-50">
                                    <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            checked={q.required}
                                            onChange={(e) => updateQuestion(q.id, { required: e.target.checked })}
                                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        Required
                                    </label>
                                    {(q.type === 'radio' || q.type === 'checkbox') && (
                                        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                checked={q.allowOther}
                                                onChange={(e) => updateQuestion(q.id, { allowOther: e.target.checked })}
                                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                            />
                                            Enable "Other" option
                                        </label>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {survey.questions.length === 0 && (
                    <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl">
                        <p className="text-gray-500">Add questions from the sidebar to build your survey.</p>
                    </div>
                )}
            </div>
        </div>
        )}

        {/* Preview Tab */}
        {activeTab === "preview" && (
            <div className="flex-1 overflow-y-auto bg-gray-50 p-8">
                <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-xl overflow-hidden min-h-[80vh]">
                     {/* Banner */}
                     {survey.branding?.bannerUrl && (
                        <div className="h-48 w-full bg-cover bg-center" style={{ backgroundImage: `url(${survey.branding.bannerUrl})` }} />
                     )}
                     
                     {/* Header */}
                     <div className={`p-8 ${survey.branding?.bannerUrl ? '' : 'pt-12'}`} style={{ backgroundColor: survey.branding?.backgroundColor || '#fff' }}>
                        <div className="flex items-center gap-4 mb-6">
                            {survey.branding?.logoUrl && (
                                <img src={survey.branding.logoUrl} alt="Logo" className="h-16 w-auto object-contain" />
                            )}
                        </div>
                        
                        <h1 className={`mb-2 ${survey.branding?.headingSize || 'text-3xl'} ${survey.branding?.headingBold !== false ? 'font-bold' : 'font-normal'} ${survey.branding?.headingItalic ? 'italic' : ''}`} style={{ color: survey.branding?.headingColor || '#111827', fontFamily: survey.branding?.fontFamily }}>
                            {survey.title}
                        </h1>
                        <p className="text-gray-600 text-lg">{survey.description}</p>
                     </div>

                     {/* Questions */}
                     <div className="p-8 space-y-8" style={{ backgroundColor: survey.branding?.backgroundColor || '#fff' }}>
                        {survey.questions.map((q, idx) => (
                            <div key={q.id} className="space-y-3">
                                <label className={`block font-medium ${survey.branding?.questionSize || 'text-base'} ${survey.branding?.questionBold ? 'font-bold' : 'font-medium'} ${survey.branding?.questionItalic ? 'italic' : ''}`} style={{ color: survey.branding?.questionColor || '#374151', fontFamily: survey.branding?.fontFamily }}>
                                    {idx + 1}. {q.text} {q.required && <span className="text-red-500">*</span>}
                                </label>
                                
                                {renderPreviewInput(q)}
                            </div>
                        ))}
                        
                        <div className="pt-6">
                            <button className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors" style={{ backgroundColor: survey.branding?.primaryColor || '#4f46e5' }}>
                                Submit Survey
                            </button>
                        </div>
                     </div>
                </div>
            </div>
        )}
      </div>
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
            return <input disabled className="w-full border-b border-gray-200 py-2 bg-transparent text-gray-400 italic" placeholder="Short answer text" />;
        case "textarea":
            return <div className="w-full border-b border-gray-200 py-2 bg-transparent text-gray-400 italic h-20">Long answer text</div>;
        case "radio":
        case "checkbox":
        case "dropdown":
            return (
                <div className="space-y-2">
                    {q.options?.map((opt, i) => (
                        <div key={opt.id} className="flex items-center gap-2">
                            <div className={`w-4 h-4 border border-gray-300 ${q.type === 'radio' ? 'rounded-full' : 'rounded'}`} />
                            <input 
                                value={opt.label}
                                onChange={(e) => updateOption(opt.id, e.target.value)}
                                className="flex-1 border-none bg-transparent focus:ring-0 text-sm hover:bg-gray-50 rounded px-2 py-1"
                            />
                            <button onClick={() => removeOption(opt.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={14}/></button>
                        </div>
                    ))}
                    <button onClick={addOption} className="text-sm text-indigo-600 font-medium hover:underline flex items-center gap-1 mt-2">
                        <Plus size={14} /> Add Option
                    </button>
                    {q.allowOther && (
                         <div className="flex items-center gap-2 mt-2 opacity-60">
                            <div className={`w-4 h-4 border border-gray-300 ${q.type === 'radio' ? 'rounded-full' : 'rounded'}`} />
                            <span className="text-sm text-gray-500 italic">Other (Respondents can type answer)</span>
                         </div>
                    )}
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
