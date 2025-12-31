"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "next/navigation";

// Types
interface QuestionOption {
    id: string;
    label: string;
}

interface Question {
    id: string;
    type: string;
    text: string;
    description?: string;
    required: boolean;
    imageUrl?: string;
    errorMessage?: string;
    options: QuestionOption[];
    scaleConfig?: { min: number; max: number; minLabel?: string; maxLabel?: string };
    sliderConfig?: { min?: number; max?: number; step?: number; unit?: string };
    matrixConfig?: { rows?: string[]; columns?: string[] };
    fileConfig?: { maxSize?: number; allowedTypes?: string[] };
}

interface SurveyData {
    id: string;
    title: string;
    description?: string;
    surveyHeading?: string;
    surveyType?: string;
    branding?: {
        primaryColor?: string;
        backgroundColor?: string;
        headingColor?: string;
        fontFamily?: string;
        logoUrl?: string;
        bannerUrl?: string;
    };
    tenant?: {
        subdomain: string;
        corporate_legal_name?: string;
        branding_config?: any;
    };
    questions: Question[];
}

export default function PublicSurveyPage() {
    const params = useParams();
    const subdomain = params?.subdomain as string;
    const slug = params?.slug as string;

    const [survey, setSurvey] = useState<SurveyData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://benefitnest-backend.onrender.com";

    useEffect(() => {
        if (slug) {
            fetchSurvey();
        }
    }, [slug]);

    const fetchSurvey = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/api/surveys/by-slug/${slug}`);
            if (res.data.success && res.data.data) {
                setSurvey(res.data.data);
            } else {
                setError("Survey not found or not active.");
            }
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to load survey.");
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerChange = (questionId: string, value: any) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
        // Clear validation error when user provides answer
        if (validationErrors[questionId]) {
            setValidationErrors(prev => {
                const updated = { ...prev };
                delete updated[questionId];
                return updated;
            });
        }
    };

    const validateAnswers = (): boolean => {
        if (!survey) return false;
        const errors: Record<string, string> = {};
        
        survey.questions.forEach(q => {
            if (q.required) {
                const answer = answers[q.id];
                if (answer === undefined || answer === null || answer === '' || 
                    (Array.isArray(answer) && answer.length === 0)) {
                    errors[q.id] = q.errorMessage || 'This field is required';
                }
            }
        });

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateAnswers()) {
            // Scroll to first error
            const firstErrorId = Object.keys(validationErrors)[0];
            if (firstErrorId) {
                document.getElementById(`question-${firstErrorId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        try {
            setSubmitting(true);
            const res = await axios.post(`${API_URL}/api/surveys/by-slug/${slug}/submit`, { 
                answers,
                respondentInfo: {
                    submittedAt: new Date().toISOString(),
                    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : null
                }
            });
            if (res.data.success) {
                setSubmitted(true);
            } else {
                setError("Failed to submit survey. Please try again.");
            }
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to submit survey.");
        } finally {
            setSubmitting(false);
        }
    };

    // Render loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading survey...</p>
                </div>
            </div>
        );
    }

    // Render error state
    if (error || !survey) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="text-center max-w-md">
                    <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">😞</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Survey Not Found</h1>
                    <p className="text-gray-500">{error || "This survey does not exist or is no longer active."}</p>
                </div>
            </div>
        );
    }

    // Render success state
    if (submitted) {
        return (
            <div 
                className="min-h-screen flex items-center justify-center p-4"
                style={{ 
                    backgroundColor: survey.branding?.backgroundColor || '#f9fafb',
                    fontFamily: survey.branding?.fontFamily || 'Inter, sans-serif'
                }}
            >
                <div className="text-center max-w-md bg-white rounded-2xl shadow-xl p-8">
                    <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                        <span className="text-4xl">🎉</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h1>
                    <p className="text-gray-600">Your response has been submitted successfully.</p>
                    {survey.tenant?.corporate_legal_name && (
                        <p className="text-sm text-gray-400 mt-4">— {survey.tenant.corporate_legal_name}</p>
                    )}
                </div>
            </div>
        );
    }

    // Render survey form
    return (
        <div 
            className="min-h-screen py-8 px-4"
            style={{ 
                backgroundColor: survey.branding?.backgroundColor || '#f9fafb',
                fontFamily: survey.branding?.fontFamily || 'Inter, sans-serif'
            }}
        >
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
                    {survey.branding?.bannerUrl && (
                        <img 
                            src={survey.branding.bannerUrl} 
                            alt="Banner" 
                            className="w-full h-48 object-cover"
                        />
                    )}
                    <div className="p-8">
                        {survey.branding?.logoUrl && (
                            <img 
                                src={survey.branding.logoUrl} 
                                alt="Logo" 
                                className="h-12 mb-4"
                            />
                        )}
                        <h1 
                            className="text-3xl font-bold mb-2"
                            style={{ color: survey.branding?.headingColor || '#111827' }}
                        >
                            {survey.surveyHeading || survey.title}
                        </h1>
                        {survey.description && (
                            <p className="text-gray-600">{survey.description}</p>
                        )}
                        {survey.tenant?.corporate_legal_name && (
                            <p className="text-sm text-gray-400 mt-2">by {survey.tenant.corporate_legal_name}</p>
                        )}
                    </div>
                </div>

                {/* Questions */}
                <div className="space-y-6">
                    {survey.questions.map((question, idx) => (
                        <div 
                            key={question.id}
                            id={`question-${question.id}`}
                            className={`bg-white rounded-xl shadow-sm p-6 border-2 transition-colors ${
                                validationErrors[question.id] ? 'border-red-300' : 'border-transparent'
                            }`}
                        >
                            {/* Question Header */}
                            <div className="mb-4">
                                <div className="flex items-start gap-3">
                                    <span 
                                        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                                        style={{ backgroundColor: survey.branding?.primaryColor || '#6366f1' }}
                                    >
                                        {idx + 1}
                                    </span>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            {question.text}
                                            {question.required && <span className="text-red-500 ml-1">*</span>}
                                        </h3>
                                        {question.description && (
                                            <p className="text-sm text-gray-500 mt-1">{question.description}</p>
                                        )}
                                    </div>
                                </div>
                                {question.imageUrl && (
                                    <img src={question.imageUrl} alt="" className="mt-4 rounded-lg max-h-48 object-cover" />
                                )}
                            </div>

                            {/* Question Input */}
                            <div className="ml-11">
                                {renderQuestionInput(question, answers[question.id], (val) => handleAnswerChange(question.id, val), survey.branding?.primaryColor)}
                            </div>

                            {/* Validation Error */}
                            {validationErrors[question.id] && (
                                <p className="ml-11 mt-2 text-sm text-red-500 flex items-center gap-1">
                                    <span>⚠️</span> {validationErrors[question.id]}
                                </p>
                            )}
                        </div>
                    ))}
                </div>

                {/* Submit Button */}
                <div className="mt-8 flex justify-end">
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="px-8 py-3 rounded-xl text-white font-semibold shadow-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ backgroundColor: survey.branding?.primaryColor || '#6366f1' }}
                    >
                        {submitting ? (
                            <span className="flex items-center gap-2">
                                <span className="animate-spin">⏳</span> Submitting...
                            </span>
                        ) : (
                            'Submit Response'
                        )}
                    </button>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center text-sm text-gray-400">
                    Powered by BenefitNest
                </div>
            </div>
        </div>
    );
}

// Helper function to render different question types
function renderQuestionInput(
    question: Question, 
    value: any, 
    onChange: (val: any) => void,
    primaryColor?: string
) {
    const color = primaryColor || '#6366f1';

    switch (question.type) {
        case 'text':
        case 'email':
            return (
                <input
                    type={question.type}
                    value={value || ''}
                    onChange={e => onChange(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:border-transparent transition-shadow"
                    style={{ '--tw-ring-color': color } as any}
                    placeholder={`Enter your ${question.type === 'email' ? 'email address' : 'answer'}...`}
                />
            );

        case 'textarea':
            return (
                <textarea
                    value={value || ''}
                    onChange={e => onChange(e.target.value)}
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:border-transparent transition-shadow resize-none"
                    style={{ '--tw-ring-color': color } as any}
                    placeholder="Enter your answer..."
                />
            );

        case 'radio':
            return (
                <div className="space-y-2">
                    {question.options.map(opt => (
                        <label 
                            key={opt.id} 
                            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                                value === opt.id ? 'border-2' : 'border-gray-200 hover:bg-gray-50'
                            }`}
                            style={value === opt.id ? { borderColor: color, backgroundColor: `${color}10` } : {}}
                        >
                            <input
                                type="radio"
                                name={question.id}
                                checked={value === opt.id}
                                onChange={() => onChange(opt.id)}
                                className="sr-only"
                            />
                            <div 
                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                    value === opt.id ? '' : 'border-gray-300'
                                }`}
                                style={value === opt.id ? { borderColor: color } : {}}
                            >
                                {value === opt.id && (
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                                )}
                            </div>
                            <span className="text-gray-700">{opt.label}</span>
                        </label>
                    ))}
                </div>
            );

        case 'checkbox':
            return (
                <div className="space-y-2">
                    {question.options.map(opt => {
                        const selected = Array.isArray(value) && value.includes(opt.id);
                        return (
                            <label 
                                key={opt.id} 
                                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                                    selected ? 'border-2' : 'border-gray-200 hover:bg-gray-50'
                                }`}
                                style={selected ? { borderColor: color, backgroundColor: `${color}10` } : {}}
                            >
                                <input
                                    type="checkbox"
                                    checked={selected}
                                    onChange={() => {
                                        const current = Array.isArray(value) ? value : [];
                                        if (selected) {
                                            onChange(current.filter((id: string) => id !== opt.id));
                                        } else {
                                            onChange([...current, opt.id]);
                                        }
                                    }}
                                    className="sr-only"
                                />
                                <div 
                                    className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                        selected ? '' : 'border-gray-300'
                                    }`}
                                    style={selected ? { borderColor: color, backgroundColor: color } : {}}
                                >
                                    {selected && (
                                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </div>
                                <span className="text-gray-700">{opt.label}</span>
                            </label>
                        );
                    })}
                </div>
            );

        case 'dropdown':
            return (
                <select
                    value={value || ''}
                    onChange={e => onChange(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:border-transparent transition-shadow bg-white"
                >
                    <option value="">Select an option...</option>
                    {question.options.map(opt => (
                        <option key={opt.id} value={opt.id}>{opt.label}</option>
                    ))}
                </select>
            );

        case 'rating':
            const stars = [1, 2, 3, 4, 5];
            return (
                <div className="flex gap-2">
                    {stars.map(star => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => onChange(star)}
                            className="text-3xl transition-transform hover:scale-110"
                        >
                            {(value || 0) >= star ? '⭐' : '☆'}
                        </button>
                    ))}
                </div>
            );

        case 'slider':
        case 'nps':
            const config: any = question.scaleConfig || question.sliderConfig || { min: 0, max: 10 };
            const min = config.min ?? 0;
            const max = config.max ?? 10;
            const minLabel = config.minLabel;
            const maxLabel = config.maxLabel;
            return (
                <div>
                    <input
                        type="range"
                        min={min}
                        max={max}
                        value={value ?? min}
                        onChange={e => onChange(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        style={{ accentColor: color }}
                    />
                    <div className="flex justify-between text-sm text-gray-500 mt-2">
                        <span>{minLabel || min}</span>
                        <span className="font-bold text-lg" style={{ color }}>{value ?? min}</span>
                        <span>{maxLabel || max}</span>
                    </div>
                </div>
            );

        case 'date':
            return (
                <input
                    type="date"
                    value={value || ''}
                    onChange={e => onChange(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:border-transparent transition-shadow"
                />
            );

        case 'file_upload':
            return (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <input
                        type="file"
                        onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) {
                                onChange({ name: file.name, size: file.size, type: file.type });
                            }
                        }}
                        className="hidden"
                        id={`file-${question.id}`}
                    />
                    <label htmlFor={`file-${question.id}`} className="cursor-pointer">
                        {value?.name ? (
                            <div>
                                <span className="text-2xl">📎</span>
                                <p className="text-gray-700 font-medium mt-2">{value.name}</p>
                                <p className="text-xs text-gray-400">Click to change file</p>
                            </div>
                        ) : (
                            <div>
                                <span className="text-2xl">📤</span>
                                <p className="text-gray-500 mt-2">Click to upload a file</p>
                            </div>
                        )}
                    </label>
                </div>
            );

        default:
            return (
                <input
                    type="text"
                    value={value || ''}
                    onChange={e => onChange(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3"
                    placeholder="Enter your answer..."
                />
            );
    }
}
