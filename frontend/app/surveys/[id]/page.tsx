"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { CheckCircle, AlertCircle } from "lucide-react";

// Reuse types or redefine (better to share, but redefining for speed/isolation)
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

interface Question {
  id: string;
  type: "text" | "textarea" | "radio" | "checkbox" | "dropdown";
  options?: QuestionOption[];
  text: string;
  required: boolean;
  imageUrl?: string;
  weightageConfig?: { totalPoints?: number };
}

interface Survey {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  status: "draft" | "active" | "closed";
}

export default function SurveyPage({ params }: { params: { id: string } }) {
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://benefitnest-backend.onrender.com";
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSurvey();
  }, [params.id]);

  const fetchSurvey = async () => {
    try {
      setLoading(true);
      // Public endpoint, no auth headers needed
      const res = await axios.get(`${API_URL}/api/surveys/${params.id}`);
      if (res.data.success) {
        setSurvey(res.data.data);
      } else {
        setError("Survey not found or unavailable.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load survey.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (qId: string, value: any) => {
    setAnswers(prev => ({ ...prev, [qId]: value }));
  };

  const handleCheckboxChange = (qId: string, optionId: string, checked: boolean) => {
    setAnswers(prev => {
      const current = prev[qId] || [];
      if (checked) {
        return { ...prev, [qId]: [...current, optionId] };
      } else {
        return { ...prev, [qId]: current.filter((id: string) => id !== optionId) };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!survey) return;

    // Validation
    for (const q of survey.questions) {
      // Required check
      if (q.required) {
        const val = answers[q.id];
        if (!val || (Array.isArray(val) && val.length === 0)) {
          alert(`Please answer: ${q.text}`);
          return;
        }
      }
      // Weightage/percentage validation for custom field group
      if (q.options && q.options.length > 0 && q.options[0].fieldType) {
        const totalTarget = q.weightageConfig?.totalPoints || 100;
        const total = q.options.filter(o => o.fieldType === 'number' || o.fieldType === 'percentage').reduce((sum, o) => sum + (Number(answers[`${q.id}_${o.id}`]) || 0), 0);
        if (q.options.some(o => o.fieldType === 'number' || o.fieldType === 'percentage') && total !== totalTarget) {
          alert(`Total for \"${q.text}\" must be exactly ${totalTarget}. Currently: ${total}`);
          return;
        }
        // Per-field admin validation
        for (const opt of q.options) {
          const val = answers[`${q.id}_${opt.id}`];
          if (opt.validation) {
            if (opt.validation.required && (val === undefined || val === '')) {
              alert(opt.validation.errorMessage || `Field "${opt.label}" is required.`);
              return;
            }
            if (typeof val === 'string' && opt.validation.regex) {
              try {
                const re = new RegExp(opt.validation.regex);
                if (!re.test(val)) {
                  alert(opt.validation.errorMessage || `Field "${opt.label}" does not match required format.`);
                  return;
                }
              } catch {}
            }
            if ((opt.fieldType === 'number' || opt.fieldType === 'percentage') && val !== undefined && val !== '') {
              const num = Number(val);
              if (opt.validation.min !== undefined && num < opt.validation.min) {
                alert(opt.validation.errorMessage || `Field "${opt.label}" must be at least ${opt.validation.min}.`);
                return;
              }
              if (opt.validation.max !== undefined && num > opt.validation.max) {
                alert(opt.validation.errorMessage || `Field "${opt.label}" must be at most ${opt.validation.max}.`);
                return;
              }
            }
          }
        }
      }
    }

    try {
      setSubmitting(true);
      const res = await axios.post(`${API_URL}/api/surveys/${survey.id}/submit`, { answers });
      if (res.data.success) {
        setCompleted(true);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to submit survey. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !survey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-sm max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600">{error || "Survey not found"}</p>
        </div>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center p-8 bg-white rounded-xl shadow-sm max-w-md w-full">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
          <p className="text-gray-600">Your response has been recorded successfully.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-sm rounded-xl overflow-hidden">
          {/* Header */}
          <div className="bg-indigo-600 px-8 py-10 text-white">
            <h1 className="text-3xl font-bold mb-2">{survey.title}</h1>
            <p className="text-indigo-100 text-lg opacity-90">{survey.description}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {survey.questions.map((q, idx) => (
              <div key={q.id} className="space-y-3">
                <label className="block text-lg font-medium text-gray-900">
                  <span className="text-gray-400 mr-2">{idx + 1}.</span>
                  {q.text}
                  {q.required && <span className="text-red-500 ml-1">*</span>}
                </label>

                {q.imageUrl && (
                  <img src={q.imageUrl} alt="Question Reference" className="max-h-64 rounded-lg border border-gray-200 mt-2" />
                )}

                <div className="mt-2">
                  {/* Dynamic custom field group logic: render all options as fields */}
                  {q.options && q.options.length > 0 && q.options[0].fieldType && (
                    <div className="space-y-3">
                      {q.options.map((opt) => (
                        <div key={opt.id} className="flex flex-wrap items-center gap-2">
                          <label className="w-32 text-gray-700 text-sm">{opt.label}</label>
                          {(() => {
                            switch (opt.fieldType) {
                              case 'text':
                                return <input type="text" className="flex-1 rounded-md border-gray-300 p-2" value={answers[`${q.id}_${opt.id}`] || ''} onChange={e => handleAnswerChange(`${q.id}_${opt.id}`, e.target.value)} required={q.required} />;
                              case 'email':
                                return <input type="email" className="flex-1 rounded-md border-gray-300 p-2" value={answers[`${q.id}_${opt.id}`] || ''} onChange={e => handleAnswerChange(`${q.id}_${opt.id}`, e.target.value)} required={q.required} />;
                              case 'date':
                                return <input type="date" className="flex-1 rounded-md border-gray-300 p-2" value={answers[`${q.id}_${opt.id}`] || ''} onChange={e => handleAnswerChange(`${q.id}_${opt.id}`, e.target.value)} required={q.required} />;
                              case 'textarea':
                                return <textarea className="flex-1 rounded-md border-gray-300 p-2" value={answers[`${q.id}_${opt.id}`] || ''} onChange={e => handleAnswerChange(`${q.id}_${opt.id}`, e.target.value)} required={q.required} />;
                              case 'number':
                              case 'percentage':
                                return <input type="number" className="flex-1 rounded-md border-gray-300 p-2" value={answers[`${q.id}_${opt.id}`] || ''} onChange={e => handleAnswerChange(`${q.id}_${opt.id}`, e.target.value)} required={q.required} />;
                              default:
                                return <input type="text" className="flex-1 rounded-md border-gray-300 p-2" value={answers[`${q.id}_${opt.id}`] || ''} onChange={e => handleAnswerChange(`${q.id}_${opt.id}`, e.target.value)} required={q.required} />;
                            }
                          })()}
                          {opt.fieldType === 'percentage' && <span className="text-xs text-gray-400">%</span>}
                        </div>
                      ))}
                      {/* Total validation for number/percentage fields */}
                      {(() => {
                        const totalTarget = q.weightageConfig?.totalPoints || 100;
                        const total = q.options.filter(o => o.fieldType === 'number' || o.fieldType === 'percentage').reduce((sum, o) => sum + (Number(answers[`${q.id}_${o.id}`]) || 0), 0);
                        const showError = q.options.some(o => o.fieldType === 'number' || o.fieldType === 'percentage') && total !== totalTarget;
                        return (
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-gray-500">Total:</span>
                            <span className={`text-xs font-bold ${showError ? 'text-red-500' : 'text-green-600'}`}>{total}</span>
                            <span className="text-xs text-gray-500">/ {totalTarget} {q.options.some(o => o.fieldType === 'percentage') ? '%' : ''}</span>
                            {showError && <span className="text-xs text-red-500 ml-2">Total must match target</span>}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                  {/* Fallback to default rendering for other question types */}
                  {!q.options || !q.options[0].fieldType && (
                    <>
                      {q.type === "text" && (
                        <input
                          type="text"
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 border"
                          placeholder="Your answer"
                          value={answers[q.id] || ""}
                          onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                          required={q.required}
                        />
                      )}
                      {q.type === "textarea" && (
                        <textarea
                          rows={4}
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 border"
                          placeholder="Your answer"
                          value={answers[q.id] || ""}
                          onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                          required={q.required}
                        />
                      )}
                      {q.type === "radio" && q.options && (
                        <div className="space-y-2">
                          {q.options.map((opt) => (
                            <label key={opt.id} className="flex items-center space-x-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer">
                              <input
                                type="radio"
                                name={q.id}
                                value={opt.id}
                                checked={answers[q.id] === opt.id}
                                onChange={() => handleAnswerChange(q.id, opt.id)}
                                className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                required={q.required}
                              />
                              <span className="text-gray-700">{opt.label}</span>
                            </label>
                          ))}
                        </div>
                      )}
                      {q.type === "checkbox" && q.options && (
                        <div className="space-y-2">
                          {q.options.map((opt) => (
                            <label key={opt.id} className="flex items-center space-x-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer">
                              <input
                                type="checkbox"
                                value={opt.id}
                                checked={(answers[q.id] || []).includes(opt.id)}
                                onChange={(e) => handleCheckboxChange(q.id, opt.id, e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                              />
                              <span className="text-gray-700">{opt.label}</span>
                            </label>
                          ))}
                        </div>
                      )}
                      {q.type === "dropdown" && q.options && (
                        <select
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 border"
                          value={answers[q.id] || ""}
                          onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                          required={q.required}
                        >
                          <option value="">Select an option</option>
                          {q.options.map((opt) => (
                            <option key={opt.id} value={opt.id}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}

            <div className="pt-6 border-t border-gray-100">
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? "Submitting..." : "Submit Survey"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
