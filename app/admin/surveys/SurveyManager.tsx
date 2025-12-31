"use client";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Plus, Search, LayoutTemplate, ArrowLeft, Upload, List, Trash2, X, Download } from "lucide-react";
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
    slug?: string;
    start_date?: string;
    end_date?: string;
    startDate?: string;
    endDate?: string;
    surveyType?: "survey" | "quiz" | "invitation" | "registration";
    surveyHeading?: string;
    templateKey?: string;
}

interface Tenant {
    id: string;
    name: string;
    subdomain: string;
    tenantCode?: string;
    country?: string;
    portalUrl?: string;
    status?: string;
    portalCreatedAt?: string;
}

// =====================================================
// SURVEY TEMPLATES DATA
// =====================================================
interface SurveyTemplate {
    id: string;
    name: string;
    description: string;
    category: "survey" | "quiz" | "invitation" | "registration";
    thumbnail: string;
    branding: BrandingConfig;
    questions: Question[];
}

const SURVEY_TEMPLATES: SurveyTemplate[] = [
    // ========== SURVEY TEMPLATES ==========
    {
        id: "employee-satisfaction",
        name: "Employee Satisfaction Survey",
        description: "Measure employee engagement, job satisfaction, and workplace culture",
        category: "survey",
        thumbnail: "📊",
        branding: {
            primaryColor: "#4f46e5",
            backgroundColor: "#f0f9ff",
            headingColor: "#1e40af",
            fontFamily: "Inter"
        },
        questions: [
            {
                id: uuidv4(),
                type: "rating",
                text: "Overall, how satisfied are you with your job?",
                description: "Rate from 1 (Very Dissatisfied) to 5 (Very Satisfied)",
                required: true,
                options: []
            },
            {
                id: uuidv4(),
                type: "radio",
                text: "How likely are you to recommend this company as a great place to work?",
                required: true,
                options: [
                    { id: uuidv4(), label: "Very Likely" },
                    { id: uuidv4(), label: "Likely" },
                    { id: uuidv4(), label: "Neutral" },
                    { id: uuidv4(), label: "Unlikely" },
                    { id: uuidv4(), label: "Very Unlikely" }
                ]
            },
            {
                id: uuidv4(),
                type: "checkbox",
                text: "What aspects of your job do you enjoy the most? (Select all that apply)",
                required: false,
                options: [
                    { id: uuidv4(), label: "Work-life balance" },
                    { id: uuidv4(), label: "Team collaboration" },
                    { id: uuidv4(), label: "Career growth opportunities" },
                    { id: uuidv4(), label: "Compensation & benefits" },
                    { id: uuidv4(), label: "Company culture" },
                    { id: uuidv4(), label: "Leadership & management" }
                ]
            },
            {
                id: uuidv4(),
                type: "nps",
                text: "On a scale of 0-10, how would you rate your work-life balance?",
                required: true,
                scaleConfig: { min: 0, max: 10, minLabel: "Poor", maxLabel: "Excellent" },
                options: []
            },
            {
                id: uuidv4(),
                type: "textarea",
                text: "What improvements would you suggest for our workplace?",
                description: "Please share your honest feedback",
                required: false,
                options: []
            }
        ]
    },
    {
        id: "customer-feedback",
        name: "Customer Feedback Survey",
        description: "Collect valuable feedback about products and services",
        category: "survey",
        thumbnail: "⭐",
        branding: {
            primaryColor: "#059669",
            backgroundColor: "#ecfdf5",
            headingColor: "#047857",
            fontFamily: "Inter"
        },
        questions: [
            {
                id: uuidv4(),
                type: "radio",
                text: "How did you hear about us?",
                required: true,
                options: [
                    { id: uuidv4(), label: "Search Engine (Google, Bing)" },
                    { id: uuidv4(), label: "Social Media" },
                    { id: uuidv4(), label: "Friend/Family Referral" },
                    { id: uuidv4(), label: "Advertisement" },
                    { id: uuidv4(), label: "Other" }
                ]
            },
            {
                id: uuidv4(),
                type: "rating",
                text: "How would you rate the quality of our product/service?",
                required: true,
                options: []
            },
            {
                id: uuidv4(),
                type: "rating",
                text: "How would you rate our customer support?",
                required: true,
                options: []
            },
            {
                id: uuidv4(),
                type: "nps",
                text: "How likely are you to recommend us to others?",
                required: true,
                scaleConfig: { min: 0, max: 10, minLabel: "Not at all likely", maxLabel: "Extremely likely" },
                options: []
            },
            {
                id: uuidv4(),
                type: "dropdown",
                text: "Which product/service did you use?",
                required: true,
                options: [
                    { id: uuidv4(), label: "Health Insurance" },
                    { id: uuidv4(), label: "Life Insurance" },
                    { id: uuidv4(), label: "Group Benefits" },
                    { id: uuidv4(), label: "Wellness Programs" },
                    { id: uuidv4(), label: "Claims Processing" }
                ]
            },
            {
                id: uuidv4(),
                type: "textarea",
                text: "Any additional comments or suggestions?",
                required: false,
                options: []
            }
        ]
    },

    // ========== QUIZ TEMPLATES ==========
    {
        id: "employee-training-quiz",
        name: "Employee Training Assessment",
        description: "Test employee knowledge after training sessions",
        category: "quiz",
        thumbnail: "🎓",
        branding: {
            primaryColor: "#7c3aed",
            backgroundColor: "#faf5ff",
            headingColor: "#6d28d9",
            fontFamily: "Inter"
        },
        questions: [
            {
                id: uuidv4(),
                type: "radio",
                text: "What is the primary purpose of our company's code of conduct?",
                description: "Select the best answer",
                required: true,
                options: [
                    { id: uuidv4(), label: "To restrict employee behavior" },
                    { id: uuidv4(), label: "To guide ethical decision-making and professional behavior" },
                    { id: uuidv4(), label: "To outline punishment for violations" },
                    { id: uuidv4(), label: "To satisfy legal requirements only" }
                ]
            },
            {
                id: uuidv4(),
                type: "radio",
                text: "Which of the following is considered confidential information?",
                required: true,
                options: [
                    { id: uuidv4(), label: "Public press releases" },
                    { id: uuidv4(), label: "Employee salary data" },
                    { id: uuidv4(), label: "Company website content" },
                    { id: uuidv4(), label: "Published annual reports" }
                ]
            },
            {
                id: uuidv4(),
                type: "checkbox",
                text: "Which of the following are examples of workplace harassment? (Select all that apply)",
                required: true,
                options: [
                    { id: uuidv4(), label: "Unwanted physical contact" },
                    { id: uuidv4(), label: "Constructive feedback in a meeting" },
                    { id: uuidv4(), label: "Offensive jokes or comments" },
                    { id: uuidv4(), label: "Excluding someone from team activities" },
                    { id: uuidv4(), label: "Normal work delegation" }
                ]
            },
            {
                id: uuidv4(),
                type: "radio",
                text: "What should you do if you witness a safety violation?",
                required: true,
                options: [
                    { id: uuidv4(), label: "Ignore it if it doesn't affect you" },
                    { id: uuidv4(), label: "Report it immediately to your supervisor or safety officer" },
                    { id: uuidv4(), label: "Wait until the next safety meeting" },
                    { id: uuidv4(), label: "Post about it on social media" }
                ]
            },
            {
                id: uuidv4(),
                type: "radio",
                text: "How often should you update your password according to company policy?",
                required: true,
                options: [
                    { id: uuidv4(), label: "Never - once set, keep it forever" },
                    { id: uuidv4(), label: "Every 90 days" },
                    { id: uuidv4(), label: "Only when you forget it" },
                    { id: uuidv4(), label: "Once a year" }
                ]
            }
        ]
    },
    {
        id: "benefits-knowledge-quiz",
        name: "Benefits Knowledge Quiz",
        description: "Test employee understanding of company benefits",
        category: "quiz",
        thumbnail: "💡",
        branding: {
            primaryColor: "#0891b2",
            backgroundColor: "#ecfeff",
            headingColor: "#0e7490",
            fontFamily: "Inter"
        },
        questions: [
            {
                id: uuidv4(),
                type: "radio",
                text: "What is the annual deductible for the Premium Health Plan?",
                required: true,
                options: [
                    { id: uuidv4(), label: "$500" },
                    { id: uuidv4(), label: "$1,000" },
                    { id: uuidv4(), label: "$1,500" },
                    { id: uuidv4(), label: "$2,000" }
                ]
            },
            {
                id: uuidv4(),
                type: "radio",
                text: "When does the open enrollment period typically occur?",
                required: true,
                options: [
                    { id: uuidv4(), label: "January" },
                    { id: uuidv4(), label: "April" },
                    { id: uuidv4(), label: "October-November" },
                    { id: uuidv4(), label: "Any time during the year" }
                ]
            },
            {
                id: uuidv4(),
                type: "checkbox",
                text: "Which of the following are covered under our dental plan? (Select all that apply)",
                required: true,
                options: [
                    { id: uuidv4(), label: "Preventive cleanings" },
                    { id: uuidv4(), label: "Orthodontics for children" },
                    { id: uuidv4(), label: "Cosmetic whitening" },
                    { id: uuidv4(), label: "Fillings and extractions" },
                    { id: uuidv4(), label: "Root canals" }
                ]
            },
            {
                id: uuidv4(),
                type: "radio",
                text: "What is the company match percentage for 401(k) contributions?",
                required: true,
                options: [
                    { id: uuidv4(), label: "25% up to 6% of salary" },
                    { id: uuidv4(), label: "50% up to 6% of salary" },
                    { id: uuidv4(), label: "100% up to 4% of salary" },
                    { id: uuidv4(), label: "No company match" }
                ]
            },
            {
                id: uuidv4(),
                type: "radio",
                text: "How many vacation days do employees receive after 5 years of service?",
                required: true,
                options: [
                    { id: uuidv4(), label: "15 days" },
                    { id: uuidv4(), label: "18 days" },
                    { id: uuidv4(), label: "20 days" },
                    { id: uuidv4(), label: "25 days" }
                ]
            }
        ]
    },

    // ========== INVITATION TEMPLATES ==========
    {
        id: "company-event-invitation",
        name: "Company Event Invitation",
        description: "Invite employees to company events with RSVP",
        category: "invitation",
        thumbnail: "🎉",
        branding: {
            primaryColor: "#db2777",
            backgroundColor: "#fdf2f8",
            headingColor: "#be185d",
            fontFamily: "Inter",
            bannerUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&h=400&fit=crop"
        },
        questions: [
            {
                id: uuidv4(),
                type: "radio",
                text: "Will you be attending the Annual Company Celebration?",
                description: "📅 Date: January 25, 2026 | 🕕 Time: 6:00 PM | 📍 Venue: Grand Ballroom",
                required: true,
                options: [
                    { id: uuidv4(), label: "Yes, I will attend" },
                    { id: uuidv4(), label: "No, I cannot attend" },
                    { id: uuidv4(), label: "Maybe, I'll confirm later" }
                ]
            },
            {
                id: uuidv4(),
                type: "radio",
                text: "Will you be bringing a plus-one?",
                required: true,
                options: [
                    { id: uuidv4(), label: "Yes" },
                    { id: uuidv4(), label: "No" }
                ]
            },
            {
                id: uuidv4(),
                type: "text",
                text: "Plus-one's full name (if applicable)",
                required: false,
                options: []
            },
            {
                id: uuidv4(),
                type: "dropdown",
                text: "Dietary preference",
                required: true,
                options: [
                    { id: uuidv4(), label: "Vegetarian" },
                    { id: uuidv4(), label: "Non-Vegetarian" },
                    { id: uuidv4(), label: "Vegan" },
                    { id: uuidv4(), label: "Gluten-Free" },
                    { id: uuidv4(), label: "No Preference" }
                ]
            },
            {
                id: uuidv4(),
                type: "textarea",
                text: "Any allergies or special requirements?",
                required: false,
                options: []
            }
        ]
    },
    {
        id: "training-session-invitation",
        name: "Training Session Invitation",
        description: "Invite participants to training sessions",
        category: "invitation",
        thumbnail: "📚",
        branding: {
            primaryColor: "#2563eb",
            backgroundColor: "#eff6ff",
            headingColor: "#1d4ed8",
            fontFamily: "Inter"
        },
        questions: [
            {
                id: uuidv4(),
                type: "radio",
                text: "Will you be attending the Leadership Development Workshop?",
                description: "📅 March 15-16, 2026 | 🕘 9:00 AM - 5:00 PM | 📍 Training Center, Floor 3",
                required: true,
                options: [
                    { id: uuidv4(), label: "Yes, I will attend both days" },
                    { id: uuidv4(), label: "Yes, Day 1 only" },
                    { id: uuidv4(), label: "Yes, Day 2 only" },
                    { id: uuidv4(), label: "No, I cannot attend" }
                ]
            },
            {
                id: uuidv4(),
                type: "checkbox",
                text: "Which topics are you most interested in? (Select all that apply)",
                required: true,
                options: [
                    { id: uuidv4(), label: "Communication Skills" },
                    { id: uuidv4(), label: "Conflict Resolution" },
                    { id: uuidv4(), label: "Team Building" },
                    { id: uuidv4(), label: "Strategic Thinking" },
                    { id: uuidv4(), label: "Performance Management" }
                ]
            },
            {
                id: uuidv4(),
                type: "dropdown",
                text: "What is your current management experience level?",
                required: true,
                options: [
                    { id: uuidv4(), label: "New to management (0-1 years)" },
                    { id: uuidv4(), label: "Developing (1-3 years)" },
                    { id: uuidv4(), label: "Experienced (3-5 years)" },
                    { id: uuidv4(), label: "Senior (5+ years)" }
                ]
            },
            {
                id: uuidv4(),
                type: "textarea",
                text: "What specific challenges would you like addressed in this training?",
                required: false,
                options: []
            }
        ]
    },

    // ========== REGISTRATION TEMPLATES ==========
    {
        id: "event-registration",
        name: "Event Registration Form",
        description: "Register attendees for company events",
        category: "registration",
        thumbnail: "📋",
        branding: {
            primaryColor: "#ea580c",
            backgroundColor: "#fff7ed",
            headingColor: "#c2410c",
            fontFamily: "Inter"
        },
        questions: [
            {
                id: uuidv4(),
                type: "text",
                text: "Full Name",
                required: true,
                options: []
            },
            {
                id: uuidv4(),
                type: "email",
                text: "Email Address",
                required: true,
                options: []
            },
            {
                id: uuidv4(),
                type: "text",
                text: "Department",
                required: true,
                options: []
            },
            {
                id: uuidv4(),
                type: "text",
                text: "Employee ID",
                required: true,
                options: []
            },
            {
                id: uuidv4(),
                type: "dropdown",
                text: "T-Shirt Size (for event merchandise)",
                required: true,
                options: [
                    { id: uuidv4(), label: "XS" },
                    { id: uuidv4(), label: "S" },
                    { id: uuidv4(), label: "M" },
                    { id: uuidv4(), label: "L" },
                    { id: uuidv4(), label: "XL" },
                    { id: uuidv4(), label: "XXL" }
                ]
            },
            {
                id: uuidv4(),
                type: "radio",
                text: "Do you require transportation assistance?",
                required: true,
                options: [
                    { id: uuidv4(), label: "Yes, I need transportation" },
                    { id: uuidv4(), label: "No, I will arrange my own" }
                ]
            },
            {
                id: uuidv4(),
                type: "textarea",
                text: "Emergency Contact (Name & Phone)",
                required: true,
                options: []
            }
        ]
    },
    {
        id: "workshop-registration",
        name: "Workshop Registration",
        description: "Register for professional development workshops",
        category: "registration",
        thumbnail: "🎯",
        branding: {
            primaryColor: "#16a34a",
            backgroundColor: "#f0fdf4",
            headingColor: "#15803d",
            fontFamily: "Inter"
        },
        questions: [
            {
                id: uuidv4(),
                type: "text",
                text: "Full Name",
                required: true,
                options: []
            },
            {
                id: uuidv4(),
                type: "email",
                text: "Work Email",
                required: true,
                options: []
            },
            {
                id: uuidv4(),
                type: "text",
                text: "Job Title",
                required: true,
                options: []
            },
            {
                id: uuidv4(),
                type: "dropdown",
                text: "Select Workshop Session",
                required: true,
                options: [
                    { id: uuidv4(), label: "Morning Session (9 AM - 12 PM)" },
                    { id: uuidv4(), label: "Afternoon Session (2 PM - 5 PM)" },
                    { id: uuidv4(), label: "Full Day (9 AM - 5 PM)" }
                ]
            },
            {
                id: uuidv4(),
                type: "radio",
                text: "Have you attended similar workshops before?",
                required: true,
                options: [
                    { id: uuidv4(), label: "Yes, multiple times" },
                    { id: uuidv4(), label: "Yes, once" },
                    { id: uuidv4(), label: "No, this is my first time" }
                ]
            },
            {
                id: uuidv4(),
                type: "checkbox",
                text: "Which learning materials would you prefer? (Select all that apply)",
                required: true,
                options: [
                    { id: uuidv4(), label: "Printed handouts" },
                    { id: uuidv4(), label: "Digital PDF" },
                    { id: uuidv4(), label: "Video recordings" },
                    { id: uuidv4(), label: "Interactive exercises" }
                ]
            },
            {
                id: uuidv4(),
                type: "textarea",
                text: "What do you hope to learn from this workshop?",
                required: false,
                options: []
            }
        ]
    }
];

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
    const [deleteTarget, setDeleteTarget] = useState<Survey | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [templateFilter, setTemplateFilter] = useState<"all" | "survey" | "quiz" | "invitation" | "registration">("all");
    
    // API URL
    const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://benefitnest-backend.onrender.com";

    const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

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
            // Use new tenants endpoint for rich data
            const res = await axios.get(`${API_URL}/api/surveys/tenants`, { headers: getAuthHeaders() });
            if (res.data.success) {
                setTenants(res.data.data.map((t: any) => ({
                    id: t.tenant_id,
                    name: t.corporate_legal_name || t.subdomain,
                    subdomain: t.subdomain,
                    tenantCode: t.tenant_code,
                    country: t.country,
                    portalUrl: t.portal_url,
                    status: t.status,
                    portalCreatedAt: t.portal_created_at
                })));
            }
        } catch (err) {
            // Fallback to old endpoint
            try {
                const res = await axios.get(`${API_URL}/api/admin/corporates`, { headers: getAuthHeaders() });
                if (res.data.success) {
                    setTenants(res.data.data.map((t: any) => ({ id: t.tenant_id, name: t.company_name || t.name, subdomain: t.subdomain })));
                }
            } catch (fallbackErr) {
                console.warn("Failed to fetch tenants", fallbackErr);
            }
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
        // Show template modal instead of directly creating
        setShowTemplateModal(true);
    };

    const handleCreateBlank = () => {
        const newSurvey: Survey = {
            id: "", // Empty ID means new survey - will be assigned by database
            title: "Untitled Survey",
            description: "",
            questions: [],
            status: "draft",
            createdAt: new Date().toISOString().split('T')[0],
            surveyType: "survey",
            surveyHeading: "",
            branding: {
                primaryColor: "#4f46e5",
                backgroundColor: "#f9fafb",
                headingColor: "#111827",
                fontFamily: "Inter"
            }
        };
        setCurrentSurvey(newSurvey);
        setSurveyUrl(null);
        setShowTemplateModal(false);
        setView("editor");
    };

    const handleCreateFromTemplate = (template: SurveyTemplate) => {
        // Generate new IDs for questions and options to avoid conflicts
        const questionsWithNewIds = template.questions.map(q => ({
            ...q,
            id: uuidv4(),
            options: q.options?.map(o => ({ ...o, id: uuidv4() })) || []
        }));

        const newSurvey: Survey = {
            id: "", // Empty ID means new survey
            title: template.name,
            description: template.description,
            questions: questionsWithNewIds,
            status: "draft",
            createdAt: new Date().toISOString().split('T')[0],
            surveyType: template.category,
            branding: template.branding
        };
        setCurrentSurvey(newSurvey);
        setSurveyUrl(null);
        setShowTemplateModal(false);
        setView("editor");
    };

    const fetchSurveyById = async (id: string) => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/api/surveys/${id}`, { headers: getAuthHeaders() });
            if (res.data.success && res.data.data) {
                setCurrentSurvey(res.data.data);
                // Set initial URL if available
                if (res.data.data.tenantId && res.data.data.slug) {
                     const tenant = tenants.find(t => t.id === res.data.data.tenantId);
                     if (tenant) {
                         setSurveyUrl(`https://${tenant.subdomain}.benefitnest.space/surveys/${res.data.data.slug}`);
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

    const handleDeleteSurvey = (survey: Survey) => {
        setDeleteTarget(survey);
    };

    const confirmDeleteSurvey = async () => {
        if (!deleteTarget) return;
        try {
            setDeleting(true);
            const res = await axios.delete(`${API_URL}/api/surveys/${deleteTarget.id}`, { headers: getAuthHeaders() });
            if (res.data.success) {
                setSurveys(surveys.filter(s => s.id !== deleteTarget.id));
                setDeleteTarget(null);
            } else {
                // keep modal open, show failure
            }
        } catch (err) {
            // keep modal open, show failure
        } finally {
            setDeleting(false);
        }
    };

    const handleExportResponses = async (surveyId: string, surveyTitle: string) => {
        try {
            showNotification("Exporting responses...");
            const res = await axios.get(`${API_URL}/api/surveys/${surveyId}/responses?format=csv`, {
                headers: getAuthHeaders(),
                responseType: 'blob'
            });
            
            // Create download link
            const blob = new Blob([res.data], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${surveyTitle.replace(/[^a-z0-9]/gi, '_')}_responses.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            showNotification("Responses exported successfully!");
        } catch (err: any) {
            console.error('Export error:', err);
            if (err.response?.status === 404) {
                showNotification("Survey not found", "error");
            } else {
                showNotification("Failed to export responses", "error");
            }
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
                                <option key={t.id} value={t.id}>
                                    {t.name}{t.subdomain ? ` (${t.subdomain})` : ''}{t.country ? ` - ${t.country}` : ''}{t.status ? ` [${t.status}]` : ''}
                                </option>
                            ))}
                        </select>
                        {/* Rich display for selected tenant */}
                        {selectedTenants[0] && (() => {
                            const tenant = tenants.find(t => t.id === selectedTenants[0]);
                            return tenant ? (
                                <div className="flex items-center gap-3 mt-2 p-3 bg-white rounded-lg border border-gray-200">
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg">
                                        {(tenant.name || tenant.subdomain || 'C')[0].toUpperCase()}
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-semibold text-gray-900">{tenant.name}</div>
                                        <div className="text-xs text-gray-500 flex items-center gap-2">
                                            <span className="font-mono bg-gray-50 px-1.5 py-0.5 rounded">{tenant.subdomain}</span>
                                            {tenant.country && <span>• {tenant.country}</span>}
                                            {tenant.status && (
                                                <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold ${tenant.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                    {tenant.status}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : null;
                        })()}
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
                        const link = survey.survey_url || (tenant && survey.slug ? `https://${tenant.subdomain}.benefitnest.space/surveys/${survey.slug}` : null);
                        return (
                        <div key={survey.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all flex flex-col h-[400px] group overflow-hidden relative">
                            {/* Card Banner */}
                            <div className="relative h-24 w-full flex-shrink-0 overflow-hidden">
                                {survey.branding?.bannerUrl ? (
                                    <img src={survey.branding.bannerUrl} alt="Banner" className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600" />
                                )}
                                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
                                
                                {/* Status Chip */}
                                <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase shadow-sm ${survey.status === 'active' ? 'bg-green-500 text-white' : survey.status === 'closed' ? 'bg-gray-500 text-white' : 'bg-yellow-400 text-yellow-900'}`}>
                                    {survey.status}
                                </div>
                                
                                {/* Survey Type Badge */}
                                {survey.surveyType && survey.surveyType !== 'survey' && (
                                    <div className="absolute top-3 left-3 px-2 py-1 rounded-full text-[10px] font-bold uppercase bg-white/90 text-indigo-700 shadow-sm">
                                        {survey.surveyType === 'quiz' ? '❓ Quiz' : survey.surveyType === 'invitation' ? '💌 Invite' : '📝 Reg'}
                                    </div>
                                )}
                            </div>

                            {/* Card Content */}
                            <div className="p-5 flex-1 flex flex-col">
                                {/* Corporate Name Badge */}
                                <div className="mb-2">
                                     <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-wide">
                                        🏢 {tenant?.name || tenant?.subdomain || 'Unknown Corporate'}
                                     </span>
                                </div>

                                <h3 className="text-lg font-bold text-gray-900 leading-tight line-clamp-2 mb-2 group-hover:text-indigo-600 transition-colors">
                                    {survey.title}
                                </h3>
                                
                                {survey.description && (
                                    <p className="text-xs text-gray-500 line-clamp-2 mb-3">{survey.description}</p>
                                )}

                                <div className="mt-auto space-y-3">
                                    {/* URL Display */}
                                    {link && (
                                        <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-100 group-hover:border-indigo-100 transition-colors">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[10px] text-gray-400 uppercase font-bold mb-0.5">Survey URL</p>
                                                <a href={link} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 font-medium truncate block hover:underline">
                                                    {link.replace('https://', '')}
                                                </a>
                                            </div>
                                            <button 
                                                onClick={() => {
                                                    navigator.clipboard.writeText(link);
                                                    showNotification("Link copied to clipboard!");
                                                }}
                                                className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                                                title="Copy Link"
                                            >
                                                <List size={14} />
                                            </button>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-50">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => fetchSurveyById(survey.id)}
                                                className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-semibold hover:bg-indigo-100 transition-colors"
                                            >
                                                Edit
                                            </button>
                                            {link && (
                                                <a
                                                    href={link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-3 py-1.5 rounded-lg bg-gray-50 text-gray-600 text-xs font-semibold hover:bg-gray-100 transition-colors"
                                                >
                                                    Preview
                                                </a>
                                            )}
                                            <button
                                                onClick={() => handleExportResponses(survey.id, survey.title)}
                                                className="px-3 py-1.5 rounded-lg bg-green-50 text-green-700 text-xs font-semibold hover:bg-green-100 transition-colors flex items-center gap-1"
                                                title="Export Responses as CSV"
                                            >
                                                <Download size={12} /> Export
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteSurvey(survey)}
                                            className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                            title="Delete Survey"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
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
                            <p className="text-gray-500 mt-1">Select a corporate or create a new survey to get started.</p>
                        </div>
                    )}
                </div>
            </main>
            {/* Delete Confirmation Modal */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
                        <div className="p-8 text-center">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-6">
                                <Trash2 className="h-8 w-8 text-red-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Delete Survey?</h3>
                            <p className="text-gray-500 mb-8">
                                Are you sure you want to delete <span className="font-bold text-gray-900">"{deleteTarget.title}"</span>? 
                                <br/>This action cannot be undone.
                            </p>
                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={() => setDeleteTarget(null)}
                                    className="px-6 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors w-full"
                                    disabled={deleting}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDeleteSurvey}
                                    className="px-6 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 shadow-lg shadow-red-200 transition-all w-full disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={deleting}
                                >
                                    {deleting ? "Deleting..." : "Yes, Delete"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Notification */}
            {notification && (
                <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg text-white z-50 animate-in fade-in slide-in-from-top-2 ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
                    {notification.message}
                </div>
            )}

            {/* Template Selection Modal */}
            {showTemplateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">Create New Survey</h2>
                                <p className="text-gray-500 mt-1">Start from scratch or choose a template</p>
                            </div>
                            <button
                                onClick={() => setShowTemplateModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X size={24} className="text-gray-400" />
                            </button>
                        </div>

                        {/* Category Filter Tabs */}
                        <div className="px-6 py-4 border-b border-gray-100 flex gap-2 flex-wrap">
                            {(['all', 'survey', 'quiz', 'invitation', 'registration'] as const).map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setTemplateFilter(cat)}
                                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors capitalize ${
                                        templateFilter === cat
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    {cat === 'all' ? 'All Templates' : cat}
                                </button>
                            ))}
                        </div>

                        {/* Template Grid */}
                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {/* Start Blank Card */}
                                <button
                                    onClick={handleCreateBlank}
                                    className="group p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border-2 border-dashed border-indigo-200 hover:border-indigo-400 transition-all text-left flex flex-col items-center justify-center min-h-[200px]"
                                >
                                    <div className="w-16 h-16 rounded-full bg-white shadow-md flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <Plus size={32} className="text-indigo-600" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-800">Start Blank</h3>
                                    <p className="text-sm text-gray-500 text-center mt-1">Create a survey from scratch</p>
                                </button>

                                {/* Template Cards */}
                                {SURVEY_TEMPLATES
                                    .filter(t => templateFilter === 'all' || t.category === templateFilter)
                                    .map((template) => (
                                        <button
                                            key={template.id}
                                            onClick={() => handleCreateFromTemplate(template)}
                                            className="group p-6 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all text-left flex flex-col min-h-[200px]"
                                        >
                                            {/* Template Thumbnail */}
                                            <div 
                                                className="w-full h-24 rounded-lg mb-4 flex items-center justify-center text-4xl"
                                                style={{ backgroundColor: template.branding?.primaryColor ? `${template.branding.primaryColor}15` : '#f3f4f6' }}
                                            >
                                                {template.thumbnail}
                                            </div>
                                            
                                            {/* Category Badge */}
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold mb-2 w-fit capitalize ${
                                                template.category === 'survey' ? 'bg-blue-100 text-blue-700' :
                                                template.category === 'quiz' ? 'bg-green-100 text-green-700' :
                                                template.category === 'invitation' ? 'bg-purple-100 text-purple-700' :
                                                'bg-orange-100 text-orange-700'
                                            }`}>
                                                {template.category}
                                            </span>

                                            <h3 className="text-base font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">
                                                {template.name}
                                            </h3>
                                            <p className="text-sm text-gray-500 mt-1 flex-1">
                                                {template.description}
                                            </p>
                                            <div className="text-xs text-gray-400 mt-3 flex items-center gap-1">
                                                <List size={12} />
                                                {template.questions.length} questions
                                            </div>
                                        </button>
                                    ))
                                }
                            </div>
                        </div>
                    </div>
                </div>
            )}

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

    const getToken = () => {
        if (typeof window === "undefined") return null;
        const cookieToken = document.cookie
            .split("; ")
            .find((r) => r.startsWith("admin_token="));
        return (cookieToken ? cookieToken.split("=")[1] : null) || localStorage.getItem("admin_token");
    };

    const getAuthHeaders = () => ({ Authorization: `Bearer ${getToken()}` });

    const autosaveSurvey = React.useCallback((updatedSurvey: Survey) => {
        // Skip autosave for new surveys (no database ID yet)
        // User must manually save first to create the survey
        if (!updatedSurvey.id) {
            return;
        }
        
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
                    id: updatedSurvey.id, // Always include ID for updates
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
                let token = null;
                if (typeof window !== "undefined") {
                    token = document.cookie.split('; ').find(r => r.startsWith('admin_token='))?.split('=')[1] || localStorage.getItem('admin_token');
                }
                const headers = token ? { Authorization: `Bearer ${token}` } : {};
                const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://benefitnest-backend.onrender.com";
                await axios.post(`${API_URL}/api/surveys`, payload, { headers });
                setAutosaveStatus('saved');
                setTimeout(() => setAutosaveStatus('idle'), 1500);
            } catch (err) {
                setAutosaveStatus('error');
                setTimeout(() => setAutosaveStatus('idle'), 2000);
            }
        }, 1000); // 1s debounce
    }, []);

    const savingRef = useRef(false);
    
    const handleSave = async () => {
        // Prevent double-saves
        if (savingRef.current || saving) return;
        savingRef.current = true;
        setSaving(true);
        try {
            // Validate survey
            if (!survey.title || !survey.tenantId || survey.questions.length === 0 || !survey.slug) {
                showNotification("Please fill all required fields and add at least one question.", "error");
                setSaving(false);
                savingRef.current = false;
                return;
            }
            // Build URL and check uniqueness
            const tenant = tenants.find(t => t.id === survey.tenantId);
            const proposedUrl = tenant ? `https://${tenant.subdomain}.benefitnest.space/${survey.slug}` : undefined;
            if (!proposedUrl) {
                showNotification("Corporate not selected.", "error");
                setSaving(false);
                return;
            }
            try {
                const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "https://benefitnest-backend.onrender.com";
                const checkRes = await axios.get(`${apiUrl}/api/surveys`, { headers: getAuthHeaders(), params: { tenantId: survey.tenantId, limit: 1000 } });
                if (checkRes.data.success && Array.isArray(checkRes.data.data)) {
                    const exists = checkRes.data.data.some((s: any) => s.survey_url === proposedUrl && s.id !== survey.id);
                    if (exists) {
                        showNotification("This survey URL name already exists. Please choose a different name.", "error");
                        setSaving(false);
                        return;
                    }
                }
            } catch {
                // If check fails, continue; backend may enforce uniqueness
            }
            // Prepare payload
            const payload: any = {
                title: survey.title,
                tenantId: survey.tenantId,
                status: survey.status,
                branding: survey.branding,
                isTemplate: survey.isTemplate,
                templateCategory: survey.templateCategory,
                survey_url: proposedUrl,
                slug: survey.slug,
                surveyType: survey.surveyType || 'survey',
                surveyHeading: survey.surveyHeading || '',
                description: survey.description || '',
                startDate: survey.startDate || survey.start_date,
                endDate: survey.endDate || survey.end_date,
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
                    onUpdate({ ...survey, id: res.data.data.id, survey_url: proposedUrl });
                }
                showNotification("Survey saved successfully!", "success");
                setSurveyUrl(proposedUrl || null);
                onSave();
            } else {
                showNotification("Failed to save survey.", "error");
            }
        } catch (err) {
            showNotification("Failed to save survey. Please try again.", "error");
        } finally {
            setSaving(false);
            savingRef.current = false;
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
        <div className="flex flex-col h-screen bg-gray-50">
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
                    <div className="space-y-3">
                        {/* Title Input */}
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
                        
                        {/* Row 1: Status + Survey Type */}
                        <div className="flex items-center gap-4 flex-wrap">
                            <div className="flex items-center gap-2">
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
                            
                            {/* Survey Type Dropdown */}
                            <div className="flex items-center gap-2">
                                <label className="text-xs text-gray-500">Type:</label>
                                <select
                                    value={survey.surveyType || 'survey'}
                                    onChange={e => {
                                        const updated = { ...survey, surveyType: e.target.value as Survey['surveyType'] };
                                        onUpdate(updated);
                                        autosaveSurvey(updated);
                                    }}
                                    className="text-xs text-gray-700 border border-gray-200 rounded px-2 py-1 bg-white font-medium"
                                >
                                    <option value="survey">📋 Survey</option>
                                    <option value="quiz">❓ Quiz</option>
                                    <option value="invitation">💌 Invitation</option>
                                    <option value="registration">📝 Registration</option>
                                </select>
                            </div>
                        </div>
                        
                        {/* Row 2: Corporate Dropdown with Rich Display */}
                        <div className="flex items-center gap-2">
                            <label className="text-xs text-gray-500">Corporate:</label>
                            <select
                                value={survey.tenantId || ''}
                                onChange={e => onUpdate({ ...survey, tenantId: e.target.value })}
                                className="text-xs text-gray-700 border border-gray-200 rounded px-2 py-1 bg-white min-w-[200px]"
                            >
                                <option value="">Select Corporate</option>
                                {tenants.map(t => (
                                    <option key={t.id} value={t.id}>
                                        {t.name}{t.subdomain ? ` (${t.subdomain})` : ''}{t.country ? ` - ${t.country}` : ''}
                                    </option>
                                ))}
                            </select>
                            {/* Rich tenant info display */}
                            {survey.tenantId && (() => {
                                const tenant = tenants.find(t => t.id === survey.tenantId);
                                return tenant ? (
                                    <div className="flex items-center gap-2 ml-2 px-2 py-1 bg-gray-50 rounded-lg border border-gray-100">
                                        <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                                            {(tenant.name || tenant.subdomain || 'C')[0].toUpperCase()}
                                        </div>
                                        <span className="text-[10px] font-mono text-gray-500">{tenant.subdomain}</span>
                                        {tenant.status && (
                                            <span className={`px-1 py-0.5 rounded text-[9px] uppercase font-bold ${tenant.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                {tenant.status}
                                            </span>
                                        )}
                                    </div>
                                ) : null;
                            })()}
                        </div>
                        
                        {/* Row 3: Survey URL Slug */}
                        
                        {/* Row 4: Survey URL Name */}
                        <div className="flex items-center gap-2">
                            <label className="text-xs text-gray-500">URL Slug:</label>
                            <input
                                value={survey.slug || ''}
                                onChange={(e) => {
                                    const raw = e.target.value || '';
                                    const slug = raw.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
                                    const updated = { ...survey, slug };
                                    onUpdate(updated);
                                    autosaveSurvey(updated);
                                }}
                                placeholder="e.g., employee-engagement-2025"
                                className="text-xs text-gray-700 border border-gray-200 rounded px-2 py-1 bg-white"
                            />
                            {survey.tenantId && survey.slug && (
                                <span className="text-[11px] text-gray-500 font-mono bg-gray-50 px-2 py-1 rounded border border-gray-100">
                                    🔗 https://{(tenants.find(t => t.id === survey.tenantId)?.subdomain) || 'corporate'}.benefitnest.space/surveys/{survey.slug}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setAiModalOpen(true)}
                        className="flex items-center gap-2 bg-gradient-to-r from-amber-500 via-red-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-all shadow-md"
                    >
                        <span role="img" aria-label="AI">✨</span> AI Magic
                    </button>
                    <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 font-medium shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                        <span role="img" aria-label="Save">💾</span> {saving ? "Saving..." : "Save"}
                    </button>
                </div>
            </div>

            {/* AI Modal */}
            {aiModalOpen && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-300 border border-pink-100">
                        <div className="bg-gradient-to-br from-amber-500 via-red-500 to-pink-500 p-8 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <span className="text-9xl">✨</span>
                            </div>
                            <h2 className="text-3xl font-extrabold mb-2 flex items-center gap-3 relative z-10">
                                <span className="text-4xl">✨</span> AI Magic
                            </h2>
                            <p className="text-white/90 relative z-10 font-medium">
                                Describe your survey needs and let our AI build it instantly.
                            </p>
                        </div>
                        
                        <div className="p-8 space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Survey Type</label>
                                <select
                                    className="w-full rounded-xl border-gray-200 bg-gray-50 p-3.5 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-shadow outline-none font-medium"
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
                                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Description & Goals</label>
                                <textarea
                                    className="w-full rounded-xl border-gray-200 bg-gray-50 p-4 h-32 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-shadow outline-none resize-none font-medium placeholder:text-gray-400"
                                    placeholder="e.g., I need a survey to measure employee satisfaction with the new health benefits package..."
                                    value={aiPrompt}
                                    onChange={e => setAiPrompt(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-4 pt-2">
                                <button
                                    onClick={() => setAiModalOpen(false)}
                                    className="px-6 py-3.5 w-1/3 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleGenerateAI}
                                    disabled={generatingAi || !aiPrompt}
                                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-amber-500 via-red-500 to-pink-500 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-red-200 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                >
                                    {generatingAi ? (
                                        <>
                                            <span className="animate-spin">✨</span> Designing...
                                        </>
                                    ) : (
                                        <>
                                            Generate Magic <span className="text-xl">✨</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Editor Tabs and Question Builder */}
            <div className="flex flex-col flex-1 overflow-hidden">
                {/* Tabs */}
                <div className="flex gap-2 px-6 pt-4 border-b border-gray-100 bg-white flex-shrink-0">
                    {['build', 'design', 'settings', 'preview'].map(tab => (
                        <button
                            key={tab}
                            className={`px-4 py-2 rounded-full font-semibold text-sm transition-colors ${activeTab === tab ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
                            onClick={() => setActiveTab(tab as typeof activeTab)}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>
                {/* Tab Content */}
                <div className="flex-1 px-6 py-6 bg-gray-50 overflow-y-auto pb-24">
                    {activeTab === 'build' && (
                        <div>
                            {/* Question Builder */}
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-900">Questions</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-3">
                                {[
                                    { t: 'text', label: 'Short Text', emoji: '✍️' },
                                    { t: 'textarea', label: 'Long Text', emoji: '📝' },
                                    { t: 'radio', label: 'Single Choice', emoji: '⭕' },
                                    { t: 'checkbox', label: 'Multiple Choice', emoji: '☑️' },
                                    { t: 'dropdown', label: 'Dropdown', emoji: '▼' },
                                    { t: 'rating', label: 'Rating', emoji: '⭐' },
                                    { t: 'slider', label: 'Slider', emoji: '📏' },
                                    { t: 'nps', label: 'NPS', emoji: '📊' },
                                    { t: 'date', label: 'Date', emoji: '📅' },
                                    { t: 'email', label: 'Email', emoji: '✉️' },
                                    { t: 'matrix', label: 'Matrix', emoji: '▦' },
                                    { t: 'ranking', label: 'Ranking', emoji: '🔢' },
                                    { t: 'file_upload', label: 'File Upload', emoji: '📎' },
                                    { t: 'weightage', label: 'Weightage', emoji: '⚖️' },
                                ].map(({ t, label, emoji }) => (
                                    <button
                                        key={t}
                                        onClick={() => addQuestion(t as QuestionType)}
                                        className="flex flex-col items-center justify-center p-3 rounded-xl border border-gray-200 bg-white hover:border-indigo-500 hover:shadow-md hover:bg-indigo-50/50 transition-all group h-24"
                                    >
                                        <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">{emoji}</span>
                                        <span className="text-xs font-semibold text-gray-700 text-center leading-tight">{label}</span>
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
                        <div className="max-w-4xl">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Survey Settings</h2>
                            
                            {/* General Settings */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    ⚙️ General Settings
                                </h3>
                                <div className="grid grid-cols-1 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Survey Description</label>
                                        <textarea
                                            value={survey.description || ''}
                                            onChange={e => {
                                                const updated = { ...survey, description: e.target.value };
                                                onUpdate(updated);
                                                autosaveSurvey(updated);
                                            }}
                                            rows={3}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            placeholder="Describe what this survey is about..."
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            {/* Schedule Settings */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    📅 Schedule
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                                        <input
                                            type="date"
                                            value={survey.startDate || survey.start_date || ''}
                                            onChange={e => {
                                                const updated = { ...survey, startDate: e.target.value, start_date: e.target.value };
                                                onUpdate(updated);
                                                autosaveSurvey(updated);
                                            }}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                                        <input
                                            type="date"
                                            value={survey.endDate || survey.end_date || ''}
                                            onChange={e => {
                                                const updated = { ...survey, endDate: e.target.value, end_date: e.target.value };
                                                onUpdate(updated);
                                                autosaveSurvey(updated);
                                            }}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Template Settings */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    📋 Template Settings
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                            <input 
                                                type="checkbox" 
                                                checked={!!survey.isTemplate} 
                                                onChange={e => {
                                                    const updated = { ...survey, isTemplate: e.target.checked };
                                                    onUpdate(updated);
                                                    autosaveSurvey(updated);
                                                }}
                                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                            />
                                            Save as Template
                                        </label>
                                        <p className="text-xs text-gray-500 ml-6">Make this survey available as a reusable template</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Template Category</label>
                                        <select
                                            value={survey.templateCategory || ''}
                                            onChange={e => {
                                                const updated = { ...survey, templateCategory: e.target.value };
                                                onUpdate(updated);
                                                autosaveSurvey(updated);
                                            }}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        >
                                            <option value="">Select Category</option>
                                            <option value="Employee Engagement">Employee Engagement</option>
                                            <option value="Benefits Enrollment">Benefits Enrollment</option>
                                            <option value="Wellness">Wellness</option>
                                            <option value="Onboarding">Onboarding</option>
                                            <option value="Feedback">Feedback</option>
                                            <option value="Event Registration">Event Registration</option>
                                            <option value="Custom">Custom</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Access & Permissions */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    🔒 Access & Visibility
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <span className="font-medium text-gray-700">Survey URL</span>
                                            {survey.tenantId && survey.slug && (
                                                <p className="text-xs text-gray-500 font-mono mt-1">
                                                    https://{(tenants.find(t => t.id === survey.tenantId)?.subdomain) || 'corporate'}.benefitnest.space/surveys/{survey.slug}
                                                </p>
                                            )}
                                        </div>
                                        {survey.tenantId && survey.slug && (
                                            <button
                                                onClick={() => {
                                                    const tenant = tenants.find(t => t.id === survey.tenantId);
                                                    if (tenant) {
                                                        navigator.clipboard.writeText(`https://${tenant.subdomain}.benefitnest.space/surveys/${survey.slug}`);
                                                        showNotification("URL copied to clipboard!");
                                                    }
                                                }}
                                                className="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold hover:bg-indigo-200 transition-colors"
                                            >
                                                📋 Copy URL
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {activeTab === 'preview' && (
                        <div
                            className="w-full flex items-start justify-center py-8"
                            style={{
                                background: survey.branding?.backgroundColor || '#f9fafb',
                                fontFamily: survey.branding?.fontFamily || 'Inter, sans-serif',
                                color: survey.branding?.questionColor || '#111827',
                            }}
                        >
                            <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                                {survey.branding?.bannerUrl && (
                                    <img src={survey.branding.bannerUrl} alt="Banner" className="w-full h-56 object-cover" />
                                )}
                                <div className="px-8 py-6">
                                    {survey.branding?.logoUrl && (
                                        <img src={survey.branding.logoUrl} alt="Logo" className="h-12 mb-4" />
                                    )}
                                    <h1
                                        className={`font-extrabold mb-2 ${survey.branding?.headingSize || 'text-3xl'} ${survey.branding?.headingBold ? 'font-bold' : ''} ${survey.branding?.headingItalic ? 'italic' : ''}`}
                                        style={{ color: survey.branding?.headingColor || '#111827' }}
                                    >
                                        {survey.title}
                                    </h1>
                                    {survey.description && (
                                        <p className="mt-1 text-gray-600">{survey.description}</p>
                                    )}
                                    <div className="mt-6 space-y-6">
                                        {survey.questions.map((q, idx) => (
                                            <div key={q.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                                <div
                                                    className={`mb-2 text-lg font-semibold ${survey.branding?.questionSize || ''} ${survey.branding?.questionBold ? 'font-bold' : ''} ${survey.branding?.questionItalic ? 'italic' : ''}`}
                                                    style={{ color: survey.branding?.questionColor || '#111827' }}
                                                >
                                                    <span className="mr-2 text-indigo-500 font-bold">Q{idx + 1}.</span> {q.text}
                                                    {q.required && <span className="ml-2 text-red-500">*</span>}
                                                </div>
                                                {q.description && <div className="mb-2 text-sm text-gray-500">{q.description}</div>}
                                                <div>{renderPreviewInput(q)}</div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-8 flex justify-end gap-3">
                                        <button className="px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200">Save Draft</button>
                                        <button className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700">Submit</button>
                                    </div>
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
