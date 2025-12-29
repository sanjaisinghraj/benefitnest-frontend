"use client";

import React, { useState } from "react";
import { 
  Plus, 
  Trash2, 
  Save, 
  Link as LinkIcon, 
  Eye, 
  MoreVertical, 
  ArrowLeft,
  Image as ImageIcon,
  CheckSquare,
  Type,
  List,
  AlignLeft,
  ChevronDown,
  Copy
} from "lucide-react";

// --- Types ---

type QuestionType = "text" | "textarea" | "radio" | "checkbox" | "dropdown";

interface QuestionOption {
  id: string;
  label: string;
}

interface Question {
  id: string;
  type: QuestionType;
  text: string;
  required: boolean;
  options?: QuestionOption[]; // For radio, checkbox, dropdown
  imageUrl?: string;
}

interface Survey {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  status: "draft" | "active" | "closed";
  createdAt: string;
  tenantId?: string;
}

// --- Mock Data ---

const MOCK_SURVEYS: Survey[] = [
  {
    id: "1",
    title: "Employee Satisfaction Survey Q1",
    description: "Help us improve our workplace environment.",
    status: "active",
    createdAt: "2024-01-15",
    questions: [
      {
        id: "q1",
        type: "radio",
        text: "How satisfied are you with your current role?",
        required: true,
        options: [
            { id: "o1", label: "Very Satisfied" },
            { id: "o2", label: "Satisfied" },
            { id: "o3", label: "Neutral" },
            { id: "o4", label: "Dissatisfied" }
        ]
      }
    ]
  }
];

// --- Components ---

export default function SurveyManager() {
  const [view, setView] = useState<"list" | "editor">("list");
  const [surveys, setSurveys] = useState<Survey[]>(MOCK_SURVEYS);
  const [currentSurvey, setCurrentSurvey] = useState<Survey | null>(null);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

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
      createdAt: new Date().toISOString().split('T')[0]
    };
    setCurrentSurvey(newSurvey);
    setView("editor");
  };

  const handleEdit = (survey: Survey) => {
    setCurrentSurvey({ ...survey }); // Deep copy in real app
    setView("editor");
  };

  const handleSave = () => {
    if (!currentSurvey) return;
    
    setSurveys(prev => {
      const exists = prev.find(s => s.id === currentSurvey.id);
      if (exists) {
        return prev.map(s => s.id === currentSurvey.id ? currentSurvey : s);
      }
      return [...prev, currentSurvey];
    });
    
    showNotification("Survey saved successfully!");
    setView("list");
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this survey?")) {
        setSurveys(prev => prev.filter(s => s.id !== id));
        showNotification("Survey deleted.");
    }
  };

  const generateUrl = (id: string) => {
    // In a real app, this would be a public facing URL
    return `https://benefitnest.space/surveys/${id}`;
  };

  if (view === "editor" && currentSurvey) {
    return (
      <SurveyEditor 
        survey={currentSurvey} 
        onUpdate={setCurrentSurvey} 
        onSave={handleSave}
        onCancel={() => setView("list")}
      />
    );
  }

  return (
    <div className="space-y-6">
      {notification && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg text-white ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'} z-50 animate-in fade-in slide-in-from-top-2`}>
            {notification.message}
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Surveys</h2>
          <p className="text-gray-500">Manage and track your tenant surveys</p>
        </div>
        <button
          onClick={handleCreateNew}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus size={20} />
          Create Survey
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {surveys.map(survey => (
          <div key={survey.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  survey.status === 'active' ? 'bg-green-100 text-green-800' :
                  survey.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {survey.status.toUpperCase()}
                </div>
                <div className="relative">
                  <button 
                    onClick={() => handleDelete(survey.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                    title="Delete Survey"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">{survey.title}</h3>
              <p className="text-gray-500 text-sm mb-4 line-clamp-2 h-10">
                {survey.description || "No description provided."}
              </p>
              
              <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100">
                <span>{survey.questions.length} Questions</span>
                <span>{survey.createdAt}</span>
              </div>
            </div>
            
            <div className="bg-gray-50 px-6 py-3 flex justify-between items-center">
              <button 
                onClick={() => {
                    navigator.clipboard.writeText(generateUrl(survey.id));
                    showNotification("URL copied to clipboard!");
                }}
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center gap-1"
              >
                <LinkIcon size={16} /> Copy Link
              </button>
              <button 
                onClick={() => handleEdit(survey)}
                className="text-gray-600 hover:text-gray-900 text-sm font-medium"
              >
                Edit Survey
              </button>
            </div>
          </div>
        ))}
        
        {surveys.length === 0 && (
            <div className="col-span-full text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                <div className="mx-auto h-12 w-12 text-gray-400">
                    <CheckSquare size={48} />
                </div>
                <h3 className="mt-2 text-sm font-semibold text-gray-900">No surveys</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating a new survey.</p>
                <div className="mt-6">
                    <button
                        onClick={handleCreateNew}
                        className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                        <Plus className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                        New Survey
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}

// --- Survey Editor Component ---

function SurveyEditor({ 
  survey, 
  onUpdate, 
  onSave, 
  onCancel 
}: { 
  survey: Survey, 
  onUpdate: (s: Survey) => void, 
  onSave: () => void, 
  onCancel: () => void 
}) {
  const [activeTab, setActiveTab] = useState<"build" | "preview">("build");

  const addQuestion = (type: QuestionType) => {
    const newQuestion: Question = {
      id: crypto.randomUUID(),
      type,
      text: "",
      required: false,
      options: ["radio", "checkbox", "dropdown"].includes(type) 
        ? [{ id: crypto.randomUUID(), label: "Option 1" }] 
        : undefined
    };
    onUpdate({
      ...survey,
      questions: [...survey.questions, newQuestion]
    });
  };

  const updateQuestion = (qId: string, updates: Partial<Question>) => {
    onUpdate({
      ...survey,
      questions: survey.questions.map(q => q.id === qId ? { ...q, ...updates } : q)
    });
  };

  const deleteQuestion = (qId: string) => {
    onUpdate({
      ...survey,
      questions: survey.questions.filter(q => q.id !== qId)
    });
  };

  const addOption = (qId: string) => {
    const q = survey.questions.find(x => x.id === qId);
    if (!q || !q.options) return;
    
    const newOption = { id: crypto.randomUUID(), label: `Option ${q.options.length + 1}` };
    updateQuestion(qId, { options: [...q.options, newOption] });
  };

  const updateOption = (qId: string, oId: string, label: string) => {
    const q = survey.questions.find(x => x.id === qId);
    if (!q || !q.options) return;

    const newOptions = q.options.map(o => o.id === oId ? { ...o, label } : o);
    updateQuestion(qId, { options: newOptions });
  };
  
  const removeOption = (qId: string, oId: string) => {
      const q = survey.questions.find(x => x.id === qId);
      if (!q || !q.options) return;
      updateQuestion(qId, { options: q.options.filter(o => o.id !== oId) });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
            <ArrowLeft size={20} />
          </button>
          <div>
            <input 
              type="text" 
              value={survey.title} 
              onChange={(e) => onUpdate({ ...survey, title: e.target.value })}
              className="text-xl font-bold text-gray-900 border-none focus:ring-0 p-0 placeholder-gray-400 bg-transparent w-full"
              placeholder="Survey Title"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
            <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                    onClick={() => setActiveTab("build")}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'build' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Build
                </button>
                <button
                    onClick={() => setActiveTab("preview")}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'preview' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Preview
                </button>
            </div>
          <button 
            onClick={onSave}
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 font-medium"
          >
            <Save size={18} />
            Save
          </button>
        </div>
      </div>

      <div className="flex flex-1 gap-6 overflow-hidden">
        {/* Sidebar - Tools */}
        {activeTab === "build" && (
            <div className="w-64 bg-white rounded-xl border border-gray-200 p-4 shadow-sm overflow-y-auto">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Question Types</h3>
            <div className="space-y-2">
                <ToolButton icon={<Type size={18} />} label="Short Answer" onClick={() => addQuestion("text")} />
                <ToolButton icon={<AlignLeft size={18} />} label="Paragraph" onClick={() => addQuestion("textarea")} />
                <ToolButton icon={<CheckSquare size={18} />} label="Multiple Choice" onClick={() => addQuestion("radio")} />
                <ToolButton icon={<List size={18} />} label="Checkboxes" onClick={() => addQuestion("checkbox")} />
                <ToolButton icon={<ChevronDown size={18} />} label="Dropdown" onClick={() => addQuestion("dropdown")} />
            </div>

            <div className="mt-8">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Settings</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select 
                            value={survey.status}
                            onChange={(e) => onUpdate({...survey, status: e.target.value as any})}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                        >
                            <option value="draft">Draft</option>
                            <option value="active">Active</option>
                            <option value="closed">Closed</option>
                        </select>
                    </div>
                </div>
            </div>
            </div>
        )}

        {/* Main Canvas */}
        <div className="flex-1 overflow-y-auto bg-white rounded-xl border border-gray-200 shadow-sm p-8">
            {activeTab === "build" ? (
                <div className="max-w-3xl mx-auto space-y-6">
                    <div className="border-b border-gray-100 pb-6 mb-6">
                        <textarea
                            value={survey.description}
                            onChange={(e) => onUpdate({ ...survey, description: e.target.value })}
                            className="w-full text-gray-600 border-none focus:ring-0 p-0 resize-none bg-transparent"
                            placeholder="Enter survey description here..."
                            rows={2}
                        />
                    </div>

                    {survey.questions.map((q, idx) => (
                    <div key={q.id} className="group relative bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all p-6">
                        {/* Question Actions */}
                        <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                                onClick={() => deleteQuestion(q.id)}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="flex gap-4 items-start pr-12">
                                <span className="text-sm font-medium text-gray-400 pt-3">{idx + 1}.</span>
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        value={q.text}
                                        onChange={(e) => updateQuestion(q.id, { text: e.target.value })}
                                        className="w-full text-lg font-medium border-0 border-b border-transparent hover:border-gray-200 focus:border-indigo-500 focus:ring-0 px-0 py-2 bg-transparent transition-colors placeholder-gray-300"
                                        placeholder="Type your question here..."
                                    />
                                </div>
                            </div>

                            {/* Image Attachment */}
                            <div className="ml-8">
                                {q.imageUrl ? (
                                    <div className="relative inline-block mt-2">
                                        <img src={q.imageUrl} alt="Question" className="max-h-48 rounded-lg border border-gray-200" />
                                        <button 
                                            onClick={() => updateQuestion(q.id, { imageUrl: undefined })}
                                            className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md text-red-500 hover:text-red-600"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ) : (
                                    <button 
                                        onClick={() => {
                                            const url = prompt("Enter image URL:");
                                            if (url) updateQuestion(q.id, { imageUrl: url });
                                        }}
                                        className="flex items-center gap-2 text-xs text-gray-400 hover:text-indigo-600 transition-colors mt-1"
                                    >
                                        <ImageIcon size={14} /> Add Image
                                    </button>
                                )}
                            </div>

                            {/* Options Area */}
                            <div className="ml-8 pt-2">
                                {renderQuestionEditor(q, updateQuestion, addOption, updateOption, removeOption)}
                            </div>

                            {/* Footer Settings */}
                            <div className="ml-8 pt-4 flex items-center gap-6 border-t border-gray-50 mt-4">
                                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={q.required}
                                        onChange={(e) => updateQuestion(q.id, { required: e.target.checked })}
                                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    Required
                                </label>
                            </div>
                        </div>
                    </div>
                    ))}

                    {survey.questions.length === 0 && (
                        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                            <p className="text-gray-500">Your survey is empty. Add a question from the sidebar.</p>
                        </div>
                    )}
                </div>
            ) : (
                // Preview Mode
                <div className="max-w-2xl mx-auto bg-white shadow-sm border border-gray-100 rounded-xl p-8 md:p-12">
                    <div className="mb-8 text-center border-b border-gray-100 pb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{survey.title || "Untitled Survey"}</h1>
                        <p className="text-gray-600">{survey.description}</p>
                    </div>

                    <div className="space-y-8">
                        {survey.questions.map((q, idx) => (
                            <div key={q.id} className="space-y-3">
                                <label className="block text-base font-semibold text-gray-900">
                                    {idx + 1}. {q.text}
                                    {q.required && <span className="text-red-500 ml-1">*</span>}
                                </label>
                                {q.imageUrl && (
                                    <img src={q.imageUrl} alt="Question" className="max-h-64 rounded-lg mb-3" />
                                )}
                                <div>
                                    {renderQuestionPreview(q)}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 pt-6 border-t border-gray-100">
                        <button disabled className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium opacity-50 cursor-not-allowed">
                            Submit Survey
                        </button>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}

// --- Helpers ---

function ToolButton({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-medium text-gray-700 bg-white hover:bg-indigo-50 hover:text-indigo-700 rounded-lg transition-colors border border-transparent hover:border-indigo-100"
    >
      <span className="text-gray-400 group-hover:text-indigo-500">{icon}</span>
      {label}
    </button>
  );
}

function renderQuestionEditor(
    q: Question, 
    updateQ: (id: string, updates: Partial<Question>) => void,
    addOpt: (id: string) => void,
    updateOpt: (qId: string, oId: string, val: string) => void,
    removeOpt: (qId: string, oId: string) => void
) {
    switch (q.type) {
        case "text":
            return <input disabled type="text" placeholder="Short answer text" className="w-full border-b border-gray-200 py-2 bg-gray-50 px-3 text-sm text-gray-500 cursor-not-allowed rounded-sm" />;
        case "textarea":
            return <textarea disabled placeholder="Long answer text" className="w-full border-b border-gray-200 py-2 bg-gray-50 px-3 text-sm text-gray-500 cursor-not-allowed rounded-sm resize-none" rows={3} />;
        case "radio":
        case "checkbox":
        case "dropdown":
            return (
                <div className="space-y-2">
                    {q.options?.map((opt, idx) => (
                        <div key={opt.id} className="flex items-center gap-2">
                            {q.type === 'radio' && <div className="w-4 h-4 rounded-full border border-gray-300" />}
                            {q.type === 'checkbox' && <div className="w-4 h-4 rounded border border-gray-300" />}
                            {q.type === 'dropdown' && <span className="text-xs text-gray-400 w-4">{idx + 1}.</span>}
                            
                            <input 
                                type="text" 
                                value={opt.label}
                                onChange={(e) => updateOpt(q.id, opt.id, e.target.value)}
                                className="flex-1 border border-gray-200 rounded px-2 py-1 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                            />
                            <button onClick={() => removeOpt(q.id, opt.id)} className="text-gray-400 hover:text-red-500">
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                    <button 
                        onClick={() => addOpt(q.id)}
                        className="text-sm text-indigo-600 hover:text-indigo-800 font-medium pl-6"
                    >
                        + Add Option
                    </button>
                </div>
            );
        default:
            return null;
    }
}

function renderQuestionPreview(q: Question) {
    switch (q.type) {
        case "text":
            return <input type="text" className="w-full border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500" placeholder="Your answer" />;
        case "textarea":
            return <textarea className="w-full border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500" rows={4} placeholder="Your answer" />;
        case "radio":
            return (
                <div className="space-y-2">
                    {q.options?.map(opt => (
                        <div key={opt.id} className="flex items-center">
                            <input type="radio" name={q.id} id={opt.id} className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500" />
                            <label htmlFor={opt.id} className="ml-2 block text-sm text-gray-700">{opt.label}</label>
                        </div>
                    ))}
                </div>
            );
        case "checkbox":
            return (
                <div className="space-y-2">
                    {q.options?.map(opt => (
                        <div key={opt.id} className="flex items-center">
                            <input type="checkbox" id={opt.id} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                            <label htmlFor={opt.id} className="ml-2 block text-sm text-gray-700">{opt.label}</label>
                        </div>
                    ))}
                </div>
            );
        case "dropdown":
            return (
                <select className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                    <option>Select an option</option>
                    {q.options?.map(opt => (
                        <option key={opt.id} value={opt.label}>{opt.label}</option>
                    ))}
                </select>
            );
        default:
            return null;
    }
}
