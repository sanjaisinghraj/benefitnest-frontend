"use client";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Plus, Search, LayoutTemplate, ArrowLeft, Upload, List, Trash2 } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

// Define Types First
type QuestionType = "text" | "textarea" | "radio" | "checkbox" | "dropdown" | "slider" | "nps" | "matrix" | "ranking" | "weightage" | "email" | "date" | "rating" | "file_upload";

interface BrandingConfig {
    headingColor?: string;
    headingSize?: "text-sm" | "text-base" | "text-lg";
    headingBold?: boolean;
    headingItalic?: boolean;
    questionColor?: string;
    questionSize?: "text-sm" | "text-base" | "text-lg";
    questionBold?: boolean;
    questionItalic?: boolean;
    primaryColor?: string;
    backgroundColor?: string;
    fontFamily?: string;
    logoUrl?: string;
    bannerUrl?: string;
}

interface QuestionOption {
    id: string;
    label: string;
    value?: string;
    type?: string;
    required?: boolean;
    errorMessage?: string;
    fieldType?: string;
}

interface Question {
    id: string;
    type: QuestionType;
    text: string;
    description?: string;
    required: boolean;
    options?: QuestionOption[];
    weightageConfig?: { totalPoints?: number };
    subQuestions?: { id: string; label: string }[];
    scaleConfig?: { min: number; max: number; minLabel: string; maxLabel: string };
    errorMessage?: string;
    allowOther?: boolean;
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
    survey_url?: string;
    start_date?: string;
    end_date?: string;
    startDate?: string;
    endDate?: string;
}

interface Tenant {
    id: string;
    name: string;
    subdomain: string;
}

// --- SurveyManager Component ---
export default function SurveyManager() {

    // --- State ---
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [surveys, setSurveys] = useState<Survey[]>([]);
    const [selectedTenants, setSelectedTenants] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);
    const [currentSurvey, setCurrentSurvey] = useState<Survey | null>(null);
    const [view, setView] = useState<'list' | 'editor'>("list");
    const [surveyUrl, setSurveyUrl] = useState<string | null>(null);
    
    // API URL
    const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://benefitnest-backend.onrender.com";

    const getToken = () => {
        if (typeof window === "undefined") return null;
        const cookieToken = document.cookie
            .split("; ")
            .find((r) => r.startsWith("admin_token="));
        return (cookieToken ? cookieToken.split("=")[1] : null) || localStorage.getItem("admin_token");
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
            const params: any = { search: searchTerm, limit: 100 }; // Increased limit
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

    useEffect(() => {
        fetchTenants();
    }, []);

    useEffect(() => {
        fetchSurveys();
    }, [selectedTenants, searchTerm]);

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
        setSurveyUrl(null);
        setView("editor");
    };

    const fetchSurveyById = async (id: string) => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/api/surveys/${id}`, { headers: getAuthHeaders() });
            if (res.data.success && res.data.data) {
                setCurrentSurvey(res.data.data);
                // Set initial URL if available
                if (res.data.data.tenantId) {
                     const tenant = tenants.find(t => t.id === res.data.data.tenantId);
                     if (tenant) {
                         setSurveyUrl(`https://${tenant.subdomain}.benefitnest.space/employeebenefitsurvey/${res.data.data.id}`);
                     }
                }
                setView("editor");
            } else {
                alert("Failed to fetch survey details.");
            }
        } catch (err) {
            alert("Error fetching survey details.");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteSurvey = async (survey: Survey) => {
        if (!window.confirm(`Are you sure you want to delete the survey "${survey.title}"? This action cannot be undone.`)) return;
        try {
            const res = await axios.delete(`${API_URL}/api/surveys/${survey.id}`, { headers: getAuthHeaders() });
            if (res.data.success) {
                setSurveys(surveys.filter(s => s.id !== survey.id));
            } else {
                alert("Failed to delete survey");
            }
        } catch (err) {
            console.error("Error deleting survey", err);
            alert("Error deleting survey");
        }
    };

    // --- Render ---
    if (view === "editor" && currentSurvey) {
        return (
            <SurveyEditor
                survey={currentSurvey}
                onUpdate={setCurrentSurvey}
                onSave={() => {
                     fetchSurveys();
                     // setView("list"); // Optional: keep in editor after save?
                }}
                onCancel={() => {
                    fetchSurveys();
                    setView("list");
                }}
                tenants={tenants}
                surveyUrl={surveyUrl}
                setSurveyUrl={setSurveyUrl}
            />
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-indigo-50">
            {/* Header */}
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
            <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-10 pb-32">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
                    <div className="flex flex-col gap-2 w-full md:w-1/2">
                        <label className="text-sm font-medium text-gray-700">Corporate Name</label>
                        <select
                            className="rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 h-12 text-base"
                            value={selectedTenants[0] || (tenants.length === 1 ? tenants[0].id : '')}
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
                        const tenant = tenants.find(t => t.id === survey.tenantId);
                        const link = survey.survey_url || (tenant ? `https://${tenant.subdomain}.benefitnest.space/employeebenefitsurvey/${survey.id}` : null);
                        return (
                        <div key={survey.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all flex flex-col h-[420px] group overflow-hidden">
                            <div className="relative h-32 w-full bg-gradient-to-r from-indigo-100 to-indigo-300 flex-shrink-0">
                                {survey.branding?.bannerUrl ? (
                                    <img src={survey.branding.bannerUrl} alt="Banner" className="absolute inset-0 w-full h-full object-cover" />
                                ) : (
                                    <div className="absolute inset-0" style={{ backgroundColor: survey.branding?.primaryColor || '#6366f1' }} />
                                )}
                                {survey.isTemplate && (
                                    <span className="absolute top-2 right-2 bg-yellow-300 text-yellow-900 px-2 py-1 rounded text-xs font-semibold shadow">TEMPLATE</span>
                                )}
                            </div>
                            <div className="p-6 flex-1 flex flex-col">
                                <h3 className="text-xl font-bold text-indigo-900 mb-1 truncate">{survey.title}</h3>
                                <p className="text-gray-500 text-sm mb-2 line-clamp-2 flex-1">{survey.description || 'No description provided.'}</p>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-600 mb-2">
                                    {tenant && (
                                        <div><span className="font-semibold">Corporate Name:</span> {tenant.name}</div>
                                    )}
                                    {tenant && (
                                        <div><span className="font-semibold">Tenant Code:</span> {tenant.id}</div>
                                    )}
                                    {tenant && (
                                        <div><span className="font-semibold">Subdomain:</span> {tenant.subdomain}</div>
                                    )}
                                    <div><span className="font-semibold">Status:</span> {survey.status}</div>
                                    {survey.start_date && (
                                        <div><span className="font-semibold">Start Date:</span> {survey.start_date}</div>
                                    )}
                                    {survey.end_date && (
                                        <div><span className="font-semibold">End Date:</span> {survey.end_date}</div>
                                    )}
                                    {survey.templateCategory && (
                                        <div><span className="font-semibold">Template Category:</span> {survey.templateCategory}</div>
                                    )}
                                </div>
                                {link && (
                                    <div className="mb-2 text-xs">
                                        <span className="font-semibold text-indigo-700">Survey URL:</span> <a href={link} target="_blank" rel="noopener noreferrer" className="underline text-indigo-600 break-all">{link}</a>
                                    </div>
                                )}
                                <div className="flex items-center justify-between text-xs text-gray-400 mt-auto pt-4 border-t border-gray-100">
                                    <span>{survey.questions?.length || survey.questionCount || 0} Questions</span>
                                    <span>{survey.createdAt}</span>
                                </div>
                                <div className="flex gap-2 mt-4">
                                    <button
                                        onClick={() => fetchSurveyById(survey.id)}
                                        className="flex-1 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 font-medium transition-colors text-sm"
                                    >
                                        Edit Survey
                                    </button>
                                    <button
                                        onClick={() => handleDeleteSurvey(survey)}
                                        className="flex items-center justify-center px-3 py-2 border border-red-500 text-red-600 rounded-lg hover:bg-red-50 font-medium transition-colors text-sm"
                                        title="Delete Survey"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
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
            {/* Footer */}
            <footer className="w-full py-6 bg-white border-t border-gray-100 mt-auto">
                <div className="max-w-7xl mx-auto px-6 text-center text-gray-400 text-sm">
                    &copy; {new Date().getFullYear()} Insurance Platform. All rights reserved.
                </div>
            </footer>
        </div>
    );
}

// --- Survey Editor Component ---

interface SurveyEditorProps {
    survey: Survey;
    onUpdate: (s: Survey) => void;
    onSave: () => void;
    onCancel: () => void;
    tenants: Tenant[];
    surveyUrl: string | null;
    setSurveyUrl: (url: string | null) => void;
}

function SurveyEditor({ survey, onUpdate, onSave, onCancel, tenants, surveyUrl, setSurveyUrl }: SurveyEditorProps) {
    const [activeTab, setActiveTab] = useState<'build' | 'design' | 'settings' | 'preview'>('build');
    const [aiModalOpen, setAiModalOpen] = useState(false);
    const [aiPrompt, setAiPrompt] = useState("");
    const [aiSurveyType, setAiSurveyType] = useState("Employee Engagement");
    const [generatingAi, setGeneratingAi] = useState(false);
    const [saving, setSaving] = useState(false);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [autosaveStatus, setAutosaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const autosaveTimeout = useRef<NodeJS.Timeout | null>(null);

    const autosaveSurvey = React.useCallback((updatedSurvey: Survey) => {
        if (autosaveTimeout.current) clearTimeout(autosaveTimeout.current);
        setAutosaveStatus('saving');
        autosaveTimeout.current = setTimeout(async () => {
            try {
                // Prepare payload
                const payload: any = {
                    title: updatedSurvey.title,
                    tenantId: updatedSurvey.tenantId,
                    status: updatedSurvey.status,
                    branding: updatedSurvey.branding,
                    isTemplate: updatedSurvey.isTemplate,
                    templateCategory: updatedSurvey.templateCategory,
                    questions: updatedSurvey.questions.map((q: Question) => ({
                        id: q.id,
                        type: q.type,
                        text: q.text,
                        description: q.description,
                        required: q.required,
                        errorMessage: q.errorMessage,
                        weightageConfig: q.weightageConfig,
                        scaleConfig: q.scaleConfig,
                        subQuestions: q.subQuestions,
                        options: q.options?.map((o: QuestionOption) => ({
                            id: o.id,
                            label: o.label,
                            type: o.type,
                            value: o.value,
                            required: o.required,
                            errorMessage: o.errorMessage,
                            fieldType: o.fieldType
                        })) || []
                    }))
                };
                // Only send id if it exists (for update)
                if (updatedSurvey.id) payload.id = updatedSurvey.id;
                let token = null;
                if (typeof window !== "undefined") {
                    token = document.cookie.split('; ').find(r => r.startsWith('admin_token='))?.split('=')[1] || localStorage.getItem('admin_token');
                }
                const headers = token ? { Authorization: `Bearer ${token}` } : {};
                const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://benefitnest-backend.onrender.com";
                const res = await axios.post(`${API_URL}/api/surveys`, payload, { headers });
                // If new survey, update local state with new id
                if (!updatedSurvey.id && res.data.success && res.data.data && res.data.data.id) {
                    onUpdate({ ...updatedSurvey, id: res.data.data.id });
                }
                setAutosaveStatus('saved');
                setTimeout(() => setAutosaveStatus('idle'), 1500);
            } catch (err) {
                setAutosaveStatus('error');
                setTimeout(() => setAutosaveStatus('idle'), 2000);
            }
        }, 1000); // 1s debounce
    }, [onUpdate]);

    const handleSave = async () => {
        setSaving(true);
        try {
            // Validate survey
            if (!survey.title || !survey.tenantId || survey.questions.length === 0) {
                showNotification("Please fill all required fields and add at least one question.", "error");
                setSaving(false);
                return;
            }
            // Prepare payload
            const payload: any = {
                title: survey.title,
                tenantId: survey.tenantId,
                status: survey.status,
                branding: survey.branding,
                isTemplate: survey.isTemplate,
                templateCategory: survey.templateCategory,
                questions: survey.questions.map((q: Question) => ({
                    id: q.id,
                    type: q.type,
                    text: q.text,
                    description: q.description,
                    required: q.required,
                    errorMessage: q.errorMessage,
                    weightageConfig: q.weightageConfig,
                    scaleConfig: q.scaleConfig,
                    subQuestions: q.subQuestions,
                    options: q.options?.map((o: QuestionOption) => ({
                        id: o.id,
                        label: o.label,
                        type: o.type,
                        value: o.value,
                        required: o.required,
                        errorMessage: o.errorMessage,
                        fieldType: o.fieldType
                    })) || []
                }))
            };
            // Only send id if it exists (for update)
            if (survey.id) payload.id = survey.id;
            let token = null;
            if (typeof window !== "undefined") {
                token = document.cookie.split('; ').find(r => r.startsWith('admin_token='))?.split('=')[1] || localStorage.getItem('admin_token');
            }
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://benefitnest-backend.onrender.com";
            const res = await axios.post(`${API_URL}/api/surveys`, payload, { headers });
            if (res.data.success && res.data.data) {
                // If new survey, update local state with new id
                if (!survey.id && res.data.data.id) {
                    onUpdate({ ...survey, id: res.data.data.id });
                }
                showNotification("Survey saved successfully!", "success");
                const tenant = tenants.find(t => t.id === survey.tenantId);
                if (tenant) {
                    setSurveyUrl(`https://${tenant.subdomain}.benefitnest.space/employeebenefitsurvey/${survey.id || res.data.data.id}`);
                }
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

    const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleGenerateAI = async () => {
        if (!aiPrompt) return;
        setGeneratingAi(true);
        try {
            const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://benefitnest-backend.onrender.com";
            const res = await axios.post(`${API_URL}/api/surveys/ai-generate`, {
                prompt: aiPrompt,
                surveyType: aiSurveyType
            });
            if (res.data.success && res.data.data && Array.isArray(res.data.data.questions)) {
                const allowedTypes = ["text", "textarea", "radio", "checkbox", "dropdown", "rating", "slider", "nps", "date", "email", "matrix", "ranking", "file_upload", "weightage"];
                const filteredQuestions = res.data.data.questions.filter((q: any) => allowedTypes.includes(q.type)).map((q: any) => ({
                    id: q.id || uuidv4(),
                    type: q.type,
                    text: q.text,
                    description: q.description,
                    required: q.required,
                    errorMessage: q.errorMessage,
                    options: q.options?.map((o: any) => ({
                        id: uuidv4(),
                        label: o.label,
                        type: o.type,
                        value: o.value,
                        required: o.required,
                        errorMessage: o.errorMessage
                    })) || []
                }));
                const updated = {
                    ...survey,
                    questions: filteredQuestions
                };
                onUpdate(updated);
                autosaveSurvey(updated);
                setAiModalOpen(false);
                showNotification("Survey generated successfully!");
            } else {
                showNotification("AI did not return valid questions.", "error");
            }
        } catch (err) {
            showNotification("Failed to generate survey. Try again.", "error");
        } finally {
            setGeneratingAi(false);
        }
    };

    const updateBranding = (key: keyof BrandingConfig, value: string) => {
        const updated = { ...survey, branding: { ...survey.branding, [key]: value } };
        onUpdate(updated);
        autosaveSurvey(updated);
    };

    const addQuestion = (type: QuestionType) => {
        const newQuestion: Question = {
            id: uuidv4(),
            type,
            text: "",
            required: false,
            options: ["radio", "checkbox", "dropdown", "ranking", "weightage"].includes(type) 
                ? [{ id: uuidv4(), label: "Option 1" }] 
                : undefined,
            subQuestions: type === "matrix" ? [{ id: uuidv4(), label: "Row 1" }] : undefined,
            scaleConfig: type === "slider" || type === "nps" ? { min: 0, max: 10, minLabel: "Poor", maxLabel: "Excellent" } : undefined
        };
        const updated = { ...survey, questions: [...survey.questions, newQuestion] };
        onUpdate(updated);
        autosaveSurvey(updated);
    };

    const updateQuestion = (id: string, updates: Partial<Question>) => {
        const updated = {
            ...survey,
            questions: survey.questions.map(q => q.id === id ? { ...q, ...updates } : q)
        };
        onUpdate(updated);
        autosaveSurvey(updated);
    };

    const deleteQuestion = (id: string) => {
        const updated = { ...survey, questions: survey.questions.filter(q => q.id !== id) };
        onUpdate(updated);
        autosaveSurvey(updated);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] bg-gray-50">
            {/* Notification */}
            {notification && (
                <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg text-white z-50 animate-in fade-in slide-in-from-top-2 ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>{notification.message}</div>
            )}
            {/* Autosave status */}
            <div className="fixed top-4 left-4 z-50">
                {autosaveStatus === 'saving' && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Autosaving...</span>}
                {autosaveStatus === 'saved' && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">All changes saved</span>}
                {autosaveStatus === 'error' && <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">Autosave failed</span>}
            </div>
            
            {/* Editor Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm z-10">
                <div className="flex items-center gap-4">
                    <button onClick={onCancel} className="text-gray-500 hover:text-gray-900 transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <input 
                            value={survey.title}
                            onChange={(e) => {
                                const updated = { ...survey, title: e.target.value };
                                onUpdate(updated);
                                autosaveSurvey(updated);
                            }}
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
                    <button
                        onClick={() => setAiModalOpen(true)}
                        className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md"
                    >
                        <span role="img" aria-label="AI">✨</span> AI Design
                    </button>
                    <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 font-medium shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed">
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

            {/* Main Editor Tabs and Question Builder */}
            <div className="flex flex-col flex-1">
                {/* Tabs */}
                <div className="flex gap-2 px-6 pt-4 border-b border-gray-100 bg-white">
                    {['build', 'design', 'settings', 'preview'].map(tab => (
                        <button
                            key={tab}
                            className={`px-4 py-2 rounded-t-lg font-medium text-sm transition-colors ${activeTab === tab ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:text-indigo-600'}`}
                            onClick={() => setActiveTab(tab as typeof activeTab)}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>
                {/* Tab Content */}
                <div className="flex-1 px-6 py-6 bg-gray-50 overflow-y-auto">
                    {activeTab === 'build' && (
                        <div>
                            {/* Question Builder */}
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-900">Questions</h2>
                                <div className="flex gap-2 flex-wrap">
                                    {['text','textarea','radio','checkbox','dropdown','rating','slider','nps','date','email','matrix','ranking','file_upload','weightage'].map(type => (
                                        <button
                                            key={type}
                                            onClick={() => addQuestion(type as QuestionType)}
                                            className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-medium hover:bg-indigo-200"
                                        >
                                            {type.charAt(0).toUpperCase() + type.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-6">
                                {survey.questions.length === 0 && (
                                    <div className="text-gray-400 italic text-center py-12">No questions added yet. Use the buttons above to add questions.</div>
                                )}
                                {survey.questions.map(q => (
                                    <div key={q.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                        <div className="flex justify-between items-center mb-2">
                                            <h3 className="font-bold text-lg text-indigo-700">{q.text || 'Untitled Question'}</h3>
                                            <div className="flex gap-2">
                                                <button onClick={() => deleteQuestion(q.id)} className="text-red-500 text-xs font-medium">Delete</button>
                                                <label className="flex items-center gap-1 text-xs text-gray-500">
                                                    <input type="checkbox" checked={q.required} onChange={e => updateQuestion(q.id, { required: e.target.checked })} /> Required
                                                </label>
                                            </div>
                                        </div>
                                        {/* Error message input for required questions */}
                                        {q.required && (
                                            <div className="mb-2">
                                                <label className="block text-xs text-gray-500 mb-1">Error Message</label>
                                                <input
                                                    type="text"
                                                    value={q.errorMessage || ''}
                                                    onChange={e => updateQuestion(q.id, { errorMessage: e.target.value })}
                                                    className="w-full border border-red-200 rounded px-2 py-1 text-xs"
                                                    placeholder="Please enter an error message for this required question"
                                                />
                                            </div>
                                        )}
                                        {/* Question Body Renderer */}
                                        {renderQuestionBody(q, (id, updates) => updateQuestion(id, updates))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {activeTab === 'design' && (
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Design & Branding</h2>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Primary Color</label>
                                    <input type="color" value={survey.branding?.primaryColor || '#6366f1'} onChange={e => updateBranding('primaryColor', e.target.value)} className="w-16 h-8 rounded" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Background Color</label>
                                    <input type="color" value={survey.branding?.backgroundColor || '#f9fafb'} onChange={e => updateBranding('backgroundColor', e.target.value)} className="w-16 h-8 rounded" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Heading Color</label>
                                    <input type="color" value={survey.branding?.headingColor || '#111827'} onChange={e => updateBranding('headingColor', e.target.value)} className="w-16 h-8 rounded" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Font Family</label>
                                    <input type="text" value={survey.branding?.fontFamily || 'Inter'} onChange={e => updateBranding('fontFamily', e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
                                    <input type="text" value={survey.branding?.logoUrl || ''} onChange={e => updateBranding('logoUrl', e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Banner URL</label>
                                    <input type="text" value={survey.branding?.bannerUrl || ''} onChange={e => updateBranding('bannerUrl', e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1" />
                                </div>
                            </div>
                        </div>
                    )}
                    {activeTab === 'settings' && (
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Survey Settings</h2>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1" title="If checked, this survey will be available as a reusable template for future surveys.">Template</label>
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="checkbox" 
                                            checked={!!survey.isTemplate} 
                                            onChange={e => onUpdate({ ...survey, isTemplate: e.target.checked })}
                                            title="Mark this survey as a template for reuse"
                                        /> 
                                        <span title="Mark this survey as a template for reuse">Mark as Template</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <input type="text" value={survey.templateCategory || ''} onChange={e => onUpdate({ ...survey, templateCategory: e.target.value })} className="w-full border border-gray-300 rounded px-2 py-1" />
                                </div>
                            </div>
                        </div>
                    )}
                    {activeTab === 'preview' && (
                        <div className="p-0 bg-transparent rounded-xl border-0 mt-6">
                            {/* Recipient Preview with Branding */}
                            <div
                                className="min-h-[600px] flex flex-col items-center justify-start w-full"
                                style={{
                                    background: survey.branding?.backgroundColor || '#f9fafb',
                                    fontFamily: survey.branding?.fontFamily || 'Inter, sans-serif',
                                    color: survey.branding?.questionColor || '#111827',
                                }}
                            >
                                {/* Banner */}
                                {survey.branding?.bannerUrl && (
                                    <img src={survey.branding.bannerUrl} alt="Banner" className="w-full max-h-48 object-cover mb-4 rounded-t-xl" />
                                )}
                                {/* Logo */}
                                {survey.branding?.logoUrl && (
                                    <img src={survey.branding.logoUrl} alt="Logo" className="h-16 mb-2 mt-4" />
                                )}
                                {/* Title */}
                                <h1
                                    className={`text-3xl font-extrabold mb-2 ${survey.branding?.headingSize || 'text-2xl'} ${survey.branding?.headingBold ? 'font-bold' : ''} ${survey.branding?.headingItalic ? 'italic' : ''}`}
                                    style={{ color: survey.branding?.headingColor || '#111827' }}
                                >
                                    {survey.title}
                                </h1>
                                {/* Description */}
                                {survey.description && (
                                    <p className="mb-6 text-lg text-gray-600 max-w-2xl text-center">{survey.description}</p>
                                )}
                                {/* Questions */}
                                <div className="w-full max-w-2xl space-y-8">
                                    {survey.questions.map((q, idx) => (
                                        <div key={q.id} className="bg-white rounded-xl shadow p-6 mb-2 border border-gray-100">
                                            <div className={`mb-2 text-lg font-semibold ${survey.branding?.questionSize || ''} ${survey.branding?.questionBold ? 'font-bold' : ''} ${survey.branding?.questionItalic ? 'italic' : ''}`}
                                                style={{ color: survey.branding?.questionColor || '#111827' }}>
                                                <span className="mr-2 text-indigo-400 font-bold">Q{idx + 1}.</span> {q.text}
                                                {q.required && <span className="ml-2 text-red-500">*</span>}
                                            </div>
                                            {q.description && <div className="mb-2 text-sm text-gray-500">{q.description}</div>}
                                            <div>{renderPreviewInput(q)}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// --- Question Body Renderer ---

function renderQuestionBody(q: Question, updateFn: (id: string, u: Partial<Question>) => void) {
    const addOption = () => {
        const opts = q.options || [];
        updateFn(q.id, { options: [...opts, { id: uuidv4(), label: `Option ${opts.length + 1}` }] });
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
        case "email":
        case "date":
        case "file_upload":
        case "textarea": {
            return (
                <div className="space-y-2">
                    <input
                        type="text"
                        value={q.text || ''}
                        onChange={e => updateFn(q.id, { text: e.target.value })}
                        className="w-full border-b border-gray-300 text-lg font-semibold focus:border-indigo-500 outline-none bg-transparent"
                        placeholder="Untitled Question"
                    />
                    <label className="flex items-center gap-2 text-xs text-gray-500">
                        <input
                            type="checkbox"
                            checked={typeof q.description === 'string'}
                            onChange={e => updateFn(q.id, { description: e.target.checked ? '' : undefined })}
                        />
                        Add Description
                    </label>
                    {typeof q.description === 'string' && (
                        <input
                            type="text"
                            value={q.description}
                            onChange={e => updateFn(q.id, { description: e.target.value })}
                            className="w-full border-b border-gray-200 text-sm focus:border-indigo-400 outline-none bg-transparent"
                            placeholder="Enter description (optional)"
                        />
                    )}
                    {q.type === "textarea" ? (
                         <textarea className="w-full border border-gray-200 rounded px-2 py-1 mt-2" rows={3} placeholder="Recipient answer (multi-line)" disabled />
                    ) : (
                         <input type={q.type === 'file_upload' ? 'text' : q.type} className="w-full border border-gray-200 rounded px-2 py-1 mt-2" placeholder={q.type === 'file_upload' ? 'File upload preview' : "Recipient answer"} disabled />
                    )}
                </div>
            );
        }
        case "radio":
        case "checkbox":
        case "dropdown":
        case "ranking": {
            return (
                <div className="space-y-2">
                    <input
                        type="text"
                        value={q.text || ''}
                        onChange={e => updateFn(q.id, { text: e.target.value })}
                        className="w-full border-b border-gray-300 text-lg font-semibold focus:border-indigo-500 outline-none bg-transparent"
                        placeholder="Untitled Question"
                    />
                     <div className="space-y-1">
                        {(q.options || []).map((o, i) => (
                            <div key={o.id} className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={o.label}
                                    onChange={e => updateOption(o.id, e.target.value)}
                                    className="flex-1 border-b border-gray-200 text-sm focus:border-indigo-400 outline-none bg-transparent"
                                    placeholder={`Option ${i + 1}`}
                                />
                                <button onClick={() => removeOption(o.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={14}/></button>
                            </div>
                        ))}
                        <button onClick={addOption} className="text-xs text-indigo-600 mt-1">+ Add Option</button>
                    </div>
                </div>
            );
        }
        case "rating":
            return (
                <div className="space-y-2">
                    <input
                         type="text"
                         value={q.text || ''}
                         onChange={e => updateFn(q.id, { text: e.target.value })}
                         className="w-full border-b border-gray-300 text-lg font-semibold focus:border-indigo-500 outline-none bg-transparent"
                         placeholder="Untitled Question"
                     />
                    <div className="flex gap-4 text-2xl text-gray-300">
                        {[1,2,3,4,5].map(i => <span key={i}>★</span>)}
                    </div>
                </div>
            );
        case "nps":
            return (
                <div className="space-y-2">
                    <input
                         type="text"
                         value={q.text || ''}
                         onChange={e => updateFn(q.id, { text: e.target.value })}
                         className="w-full border-b border-gray-300 text-lg font-semibold focus:border-indigo-500 outline-none bg-transparent"
                         placeholder="Untitled Question"
                     />
                    <div className="flex gap-1 overflow-x-auto py-2">
                        {[0,1,2,3,4,5,6,7,8,9,10].map(n => (
                            <div key={n} className="w-10 h-10 flex items-center justify-center border border-gray-200 rounded-md text-sm text-gray-500 bg-gray-50">
                                {n}
                            </div>
                        ))}
                    </div>
                </div>
            );
        case "matrix":
            return (
                <div className="space-y-6">
                    <input
                         type="text"
                         value={q.text || ''}
                         onChange={e => updateFn(q.id, { text: e.target.value })}
                         className="w-full border-b border-gray-300 text-lg font-semibold focus:border-indigo-500 outline-none bg-transparent"
                         placeholder="Untitled Question"
                     />
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
                                    const newSub = { id: uuidv4(), label: `Row ${(q.subQuestions?.length || 0) + 1}` };
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
                    <input
                         type="text"
                         value={q.text || ''}
                         onChange={e => updateFn(q.id, { text: e.target.value })}
                         className="w-full border-b border-gray-300 text-lg font-semibold focus:border-indigo-500 outline-none bg-transparent"
                         placeholder="Untitled Question"
                     />
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
                    <input
                         type="text"
                         value={q.text || ''}
                         onChange={e => updateFn(q.id, { text: e.target.value })}
                         className="w-full border-b border-gray-300 text-lg font-semibold focus:border-indigo-500 outline-none bg-transparent"
                         placeholder="Untitled Question"
                     />
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase">Min Value</label>
                            <input 
                                type="number" 
                                value={q.scaleConfig?.min ?? 0}
                                onChange={(e) => updateFn(q.id, { scaleConfig: {
                                    min: isNaN(parseInt(e.target.value)) ? 0 : parseInt(e.target.value),
                                    max: typeof q.scaleConfig?.max === 'number' ? q.scaleConfig.max : 10,
                                    minLabel: q.scaleConfig?.minLabel ?? "Poor",
                                    maxLabel: q.scaleConfig?.maxLabel ?? "Excellent"
                                } })}
                                className="w-full border-b border-gray-200 py-1 bg-transparent text-sm"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase">Max Value</label>
                            <input 
                                type="number" 
                                value={q.scaleConfig?.max ?? 100}
                                onChange={(e) => updateFn(q.id, { scaleConfig: {
                                    min: typeof q.scaleConfig?.min === 'number' ? q.scaleConfig.min : 0,
                                    max: isNaN(parseInt(e.target.value)) ? 10 : parseInt(e.target.value),
                                    minLabel: q.scaleConfig?.minLabel ?? "Poor",
                                    maxLabel: q.scaleConfig?.maxLabel ?? "Excellent"
                                } })}
                                className="w-full border-b border-gray-200 py-1 bg-transparent text-sm"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase">Min Label</label>
                            <input 
                                value={q.scaleConfig?.minLabel || ''}
                                onChange={(e) => updateFn(q.id, { scaleConfig: {
                                    min: typeof q.scaleConfig?.min === 'number' ? q.scaleConfig.min : 0,
                                    max: typeof q.scaleConfig?.max === 'number' ? q.scaleConfig.max : 10,
                                    minLabel: e.target.value,
                                    maxLabel: q.scaleConfig?.maxLabel ?? "Excellent"
                                } })}
                                className="w-full border-b border-gray-200 py-1 bg-transparent text-sm"
                                placeholder="e.g. Poor"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase">Max Label</label>
                            <input 
                                value={q.scaleConfig?.maxLabel || ''}
                                onChange={(e) => updateFn(q.id, { scaleConfig: {
                                    min: typeof q.scaleConfig?.min === 'number' ? q.scaleConfig.min : 0,
                                    max: typeof q.scaleConfig?.max === 'number' ? q.scaleConfig.max : 10,
                                    minLabel: q.scaleConfig?.minLabel ?? "Poor",
                                    maxLabel: e.target.value
                                } })}
                                className="w-full border-b border-gray-200 py-1 bg-transparent text-sm"
                                placeholder="e.g. Excellent"
                            />
                        </div>
                    </div>
                </div>
            );
        default:
            return <div className="text-gray-400 italic text-sm">Preview not available for this type</div>;
    }
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
