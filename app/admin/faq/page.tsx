"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import AdminTopBar from "../components/AdminTopBar";
import AdminFooter from "../components/AdminFooter";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://benefitnest-backend.onrender.com";

// Types
interface FAQ {
  id: string;
  question: string;
  answer: string;
  country: string;
  category: string;
  policy_type_code: string;
  policy_type_name: string;
  display_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

interface PolicyType {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  country: string;
  is_active: boolean;
}

interface Tenant {
  tenant_id: string;
  corporate_legal_name: string;
  subdomain: string;
  country: string;
}

interface FAQMapping {
  faq_id: string;
  tenant_id: string | null; // null means mapped to all tenants
}

// Color palette
const colors = {
  primary: "#6366f1",
  primaryLight: "#eef2ff",
  secondary: "#8b5cf6",
  success: "#10b981",
  warning: "#f59e0b",
  error: "#ef4444",
  gray: {
    50: "#f9fafb",
    100: "#f3f4f6",
    200: "#e5e7eb",
    300: "#d1d5db",
    400: "#9ca3af",
    500: "#6b7280",
    600: "#4b5563",
    700: "#374151",
    800: "#1f2937",
    900: "#111827",
  },
};

// Pre-defined FAQs based on policy types
const predefinedFAQs: Omit<FAQ, "id" | "created_at" | "updated_at">[] = [
  // Health - India
  {
    question: "What is Group Health Insurance?",
    answer: "Group Health Insurance (GMC) is a type of health insurance that covers a group of people, typically employees of a company. It provides medical coverage including hospitalization, day care procedures, and pre/post hospitalization expenses.",
    country: "India",
    category: "Health",
    policy_type_code: "GROUP_HEALTH_IND",
    policy_type_name: "Group Health / Medical Insurance",
    display_order: 1,
    is_active: true,
  },
  {
    question: "Who is covered under Group Health Insurance?",
    answer: "Typically, the employee and their dependents (spouse, children, and sometimes parents) are covered. The exact coverage depends on the policy terms chosen by the employer.",
    country: "India",
    category: "Health",
    policy_type_code: "GROUP_HEALTH_IND",
    policy_type_name: "Group Health / Medical Insurance",
    display_order: 2,
    is_active: true,
  },
  {
    question: "What is the waiting period for pre-existing diseases?",
    answer: "For group policies, there is usually no waiting period for pre-existing diseases. Coverage starts from day one of policy inception. However, this may vary based on the policy terms.",
    country: "India",
    category: "Health",
    policy_type_code: "GROUP_HEALTH_IND",
    policy_type_name: "Group Health / Medical Insurance",
    display_order: 3,
    is_active: true,
  },
  // Health - USA
  {
    question: "What is employer-sponsored health insurance?",
    answer: "Employer-sponsored health insurance is a health policy that an employer purchases and offers to eligible employees and their dependents. The employer typically pays a portion of the premium.",
    country: "USA",
    category: "Health",
    policy_type_code: "GROUP_HEALTH_USA",
    policy_type_name: "Group Health / Medical Insurance",
    display_order: 1,
    is_active: true,
  },
  {
    question: "What is COBRA coverage?",
    answer: "COBRA (Consolidated Omnibus Budget Reconciliation Act) allows employees to continue their group health coverage for a limited time after leaving employment, though they must pay the full premium.",
    country: "USA",
    category: "Health",
    policy_type_code: "GROUP_HEALTH_USA",
    policy_type_name: "Group Health / Medical Insurance",
    display_order: 2,
    is_active: true,
  },
  // Health - UAE Dubai
  {
    question: "Is health insurance mandatory in Dubai?",
    answer: "Yes, health insurance is mandatory for all employees in Dubai. Employers must provide health insurance coverage to their employees as per Dubai Health Authority (DHA) regulations.",
    country: "UAE",
    category: "Health",
    policy_type_code: "GROUP_HEALTH_UAE_DXB",
    policy_type_name: "Group Health / Medical Insurance",
    display_order: 1,
    is_active: true,
  },
  // Life - India
  {
    question: "What is Group Term Life Insurance?",
    answer: "Group Term Life Insurance (GTL) provides life coverage to employees. In case of death during employment, the nominee receives a lump sum benefit, typically a multiple of annual salary.",
    country: "India",
    category: "Life",
    policy_type_code: "GROUP_TERM_LIFE_IND",
    policy_type_name: "Group Term Life Insurance",
    display_order: 1,
    is_active: true,
  },
  {
    question: "How is the sum assured calculated in GTL?",
    answer: "The sum assured in GTL is usually calculated as a multiple of the employee's annual CTC (Cost to Company). Common multiples are 2x, 3x, or 5x of annual salary.",
    country: "India",
    category: "Life",
    policy_type_code: "GROUP_TERM_LIFE_IND",
    policy_type_name: "Group Term Life Insurance",
    display_order: 2,
    is_active: true,
  },
  // Accident - USA
  {
    question: "What does Workers Compensation cover?",
    answer: "Workers Compensation provides benefits to employees who suffer work-related injuries or illnesses. It covers medical expenses, lost wages, rehabilitation costs, and death benefits.",
    country: "USA",
    category: "Accident",
    policy_type_code: "WORKERS_COMP_USA_ALL",
    policy_type_name: "Workers Compensation",
    display_order: 1,
    is_active: true,
  },
  // Retirement - India
  {
    question: "What is EPF (Employees Provident Fund)?",
    answer: "EPF is a statutory retirement savings scheme where both employer and employee contribute 12% of basic salary. It provides retirement corpus, partial withdrawal facility, and pension benefits.",
    country: "India",
    category: "Retirement",
    policy_type_code: "EPF_IND",
    policy_type_name: "Employees Provident Fund",
    display_order: 1,
    is_active: true,
  },
  {
    question: "What is Gratuity?",
    answer: "Gratuity is a statutory benefit payable to employees who have completed 5 or more years of continuous service. It is calculated as 15 days salary for each year of service.",
    country: "India",
    category: "Retirement",
    policy_type_code: "GRATUITY_IND",
    policy_type_name: "Gratuity",
    display_order: 2,
    is_active: true,
  },
  // Wellness - Global
  {
    question: "What is an Employee Assistance Program (EAP)?",
    answer: "EAP is a workplace program designed to help employees deal with personal problems that might adversely impact their work performance, health, and well-being. It typically includes counseling services.",
    country: "India",
    category: "Wellness",
    policy_type_code: "EAP_IND",
    policy_type_name: "Employee Assistance Program",
    display_order: 1,
    is_active: true,
  },
  // Corporate - Global
  {
    question: "What is D&O (Directors & Officers) Liability Insurance?",
    answer: "D&O insurance protects directors and officers of a company against personal losses if they are sued for alleged wrongful acts while managing the company.",
    country: "Global",
    category: "Corporate",
    policy_type_code: "DNO_GLOBAL",
    policy_type_name: "Directors & Officers Liability",
    display_order: 1,
    is_active: true,
  },
];

// Get unique values for filters
const countries = [
  "All Countries",
  "India",
  "USA",
  "UK",
  "UAE",
  "Singapore",
  "Canada",
  "Australia",
  "Germany",
  "Global",
  "EU",
  "Brazil",
  "France",
  "Japan",
  "South Africa",
  "Mexico",
  "LATAM",
];

const categories = [
  "All Categories",
  "Health",
  "Life",
  "Accident",
  "Retirement",
  "Wellness",
  "Corporate",
  "Income",
  "Retail-Health",
  "Retail-Life",
  "Retail-Motor",
  "Retail-Property",
  "Retail-Travel",
  "Retail-Misc",
];

// Helper functions
const getAuthHeaders = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
  return { Authorization: `Bearer ${token}` };
};

const generateId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

// UI Components
const Badge = ({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "error" | "primary";
}) => {
  const variants = {
    default: { bg: colors.gray[100], color: colors.gray[700] },
    success: { bg: "#dcfce7", color: "#166534" },
    warning: { bg: "#fef3c7", color: "#92400e" },
    error: { bg: "#fee2e2", color: "#991b1b" },
    primary: { bg: colors.primaryLight, color: colors.primary },
  };
  const style = variants[variant];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "4px 10px",
        borderRadius: "6px",
        fontSize: "12px",
        fontWeight: 600,
        backgroundColor: style.bg,
        color: style.color,
      }}
    >
      {children}
    </span>
  );
};

const Button = ({
  children,
  variant = "primary",
  size = "md",
  icon,
  onClick,
  disabled,
  loading,
  style: customStyle,
}: {
  children: React.ReactNode;
  variant?: "primary" | "outline" | "danger" | "success" | "ghost";
  size?: "xs" | "sm" | "md" | "lg";
  icon?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: React.CSSProperties;
}) => {
  const variants: Record<string, { bg: string; color: string; border: string }> = {
    primary: {
      bg: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
      color: "white",
      border: "none",
    },
    outline: {
      bg: "white",
      color: colors.gray[700],
      border: `2px solid ${colors.gray[200]}`,
    },
    danger: {
      bg: colors.error,
      color: "white",
      border: "none",
    },
    success: {
      bg: colors.success,
      color: "white",
      border: "none",
    },
    ghost: {
      bg: "transparent",
      color: colors.gray[600],
      border: "none",
    },
  };
  const sizes: Record<string, { padding: string; fontSize: string }> = {
    xs: { padding: "4px 8px", fontSize: "11px" },
    sm: { padding: "6px 12px", fontSize: "12px" },
    md: { padding: "10px 18px", fontSize: "14px" },
    lg: { padding: "12px 24px", fontSize: "15px" },
  };
  const v = variants[variant];
  const s = sizes[size];
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        background: v.bg,
        color: v.color,
        border: v.border,
        borderRadius: "8px",
        padding: s.padding,
        fontSize: s.fontSize,
        fontWeight: 600,
        cursor: disabled || loading ? "not-allowed" : "pointer",
        opacity: disabled || loading ? 0.6 : 1,
        transition: "all 0.2s",
        ...customStyle,
      }}
    >
      {loading ? "⏳" : icon}
      {children}
    </button>
  );
};

const Input = ({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  disabled,
  style,
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
}) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "6px", ...style }}>
    {label && (
      <label style={{ fontSize: "13px", fontWeight: 600, color: colors.gray[700] }}>
        {label}
      </label>
    )}
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      style={{
        padding: "10px 14px",
        border: `1px solid ${colors.gray[200]}`,
        borderRadius: "8px",
        fontSize: "14px",
        outline: "none",
        transition: "border-color 0.2s",
      }}
    />
  </div>
);

const TextArea = ({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
  disabled,
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
}) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
    {label && (
      <label style={{ fontSize: "13px", fontWeight: 600, color: colors.gray[700] }}>
        {label}
      </label>
    )}
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      disabled={disabled}
      style={{
        padding: "10px 14px",
        border: `1px solid ${colors.gray[200]}`,
        borderRadius: "8px",
        fontSize: "14px",
        outline: "none",
        resize: "vertical",
        fontFamily: "inherit",
      }}
    />
  </div>
);

const Select = ({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
    {label && (
      <label style={{ fontSize: "13px", fontWeight: 600, color: colors.gray[700] }}>
        {label}
      </label>
    )}
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        padding: "10px 14px",
        border: `1px solid ${colors.gray[200]}`,
        borderRadius: "8px",
        fontSize: "14px",
        outline: "none",
        backgroundColor: "white",
        cursor: "pointer",
      }}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  width = "600px",
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: string;
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "16px",
          width: "100%",
          maxWidth: width,
          maxHeight: "90vh",
          overflow: "auto",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "20px 24px",
            borderBottom: `1px solid ${colors.gray[200]}`,
          }}
        >
          <h3 style={{ fontSize: "18px", fontWeight: 700, color: colors.gray[800], margin: 0 }}>
            {title}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
              color: colors.gray[400],
              padding: "4px",
            }}
          >
            ×
          </button>
        </div>
        <div style={{ padding: "24px" }}>{children}</div>
      </div>
    </div>
  );
};

const Toast = ({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "success" | "error" | "info";
  onClose: () => void;
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColors = {
    success: "#10b981",
    error: "#ef4444",
    info: "#3b82f6",
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        backgroundColor: bgColors[type],
        color: "white",
        padding: "14px 20px",
        borderRadius: "10px",
        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
        zIndex: 1001,
        display: "flex",
        alignItems: "center",
        gap: "10px",
        fontSize: "14px",
        fontWeight: 500,
      }}
    >
      {type === "success" ? "✓" : type === "error" ? "✕" : "ℹ"}
      {message}
    </div>
  );
};

// Main Component
export default function FAQManagementPage() {
  const router = useRouter();

  // State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [policyTypes, setPolicyTypes] = useState<PolicyType[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [faqMappings, setFaqMappings] = useState<FAQMapping[]>([]);

  // Filters
  const [filterCountry, setFilterCountry] = useState("All Countries");
  const [filterCategory, setFilterCategory] = useState("All Categories");
  const [filterPolicyType, setFilterPolicyType] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMappingModal, setShowMappingModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedFAQ, setSelectedFAQ] = useState<FAQ | null>(null);

  // Form state for add/edit
  const [formData, setFormData] = useState<Omit<FAQ, "id" | "created_at" | "updated_at">>({
    question: "",
    answer: "",
    country: "India",
    category: "Health",
    policy_type_code: "",
    policy_type_name: "",
    display_order: 1,
    is_active: true,
  });

  // Mapping state
  const [selectedTenantForMapping, setSelectedTenantForMapping] = useState<string>("");
  const [mapToAllTenants, setMapToAllTenants] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const showToast = (message: string, type: "success" | "error" | "info") => {
    setToast({ message, type });
  };

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch tenants
        const tenantsRes = await axios.get(`${API_URL}/api/admin/corporates`, {
          headers: getAuthHeaders(),
        });
        if (tenantsRes.data.success) {
          setTenants(tenantsRes.data.data || []);
        }

        // Try to fetch existing FAQs from backend
        try {
          const faqsRes = await axios.get(`${API_URL}/api/admin/faqs`, {
            headers: getAuthHeaders(),
          });
          if (faqsRes.data.success && faqsRes.data.data?.length > 0) {
            setFaqs(faqsRes.data.data);
          } else {
            // Use predefined FAQs with generated IDs
            setFaqs(predefinedFAQs.map((faq) => ({ ...faq, id: generateId() })));
          }
        } catch {
          // Use predefined FAQs if endpoint doesn't exist yet
          setFaqs(predefinedFAQs.map((faq) => ({ ...faq, id: generateId() })));
        }

        // Try to fetch policy types
        try {
          const policyTypesRes = await axios.get(`${API_URL}/api/admin/policy-types`, {
            headers: getAuthHeaders(),
          });
          if (policyTypesRes.data.success) {
            setPolicyTypes(policyTypesRes.data.data || []);
          }
        } catch {
          // Policy types endpoint might not exist
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
        // Still load predefined FAQs
        setFaqs(predefinedFAQs.map((faq) => ({ ...faq, id: generateId() })));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtered FAQs based on filters
  const filteredFAQs = useMemo(() => {
    return faqs.filter((faq) => {
      const matchesCountry = filterCountry === "All Countries" || faq.country === filterCountry;
      const matchesCategory = filterCategory === "All Categories" || faq.category === filterCategory;
      const matchesPolicyType = !filterPolicyType || faq.policy_type_code === filterPolicyType;
      const matchesSearch =
        !searchQuery ||
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCountry && matchesCategory && matchesPolicyType && matchesSearch;
    });
  }, [faqs, filterCountry, filterCategory, filterPolicyType, searchQuery]);

  // Get unique policy types from FAQs for filter dropdown
  const availablePolicyTypes = useMemo(() => {
    const types = new Map<string, string>();
    faqs.forEach((faq) => {
      if (faq.policy_type_code && faq.policy_type_name) {
        types.set(faq.policy_type_code, faq.policy_type_name);
      }
    });
    return Array.from(types.entries()).map(([code, name]) => ({
      value: code,
      label: name,
    }));
  }, [faqs]);

  // Handlers
  const handleAddFAQ = () => {
    setFormData({
      question: "",
      answer: "",
      country: filterCountry !== "All Countries" ? filterCountry : "India",
      category: filterCategory !== "All Categories" ? filterCategory : "Health",
      policy_type_code: filterPolicyType || "",
      policy_type_name: "",
      display_order: filteredFAQs.length + 1,
      is_active: true,
    });
    setShowAddModal(true);
  };

  const handleEditFAQ = (faq: FAQ) => {
    setSelectedFAQ(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      country: faq.country,
      category: faq.category,
      policy_type_code: faq.policy_type_code,
      policy_type_name: faq.policy_type_name,
      display_order: faq.display_order,
      is_active: faq.is_active,
    });
    setShowEditModal(true);
  };

  const handleDeleteFAQ = (faq: FAQ) => {
    setSelectedFAQ(faq);
    setShowDeleteConfirm(true);
  };

  const handleMappingFAQ = (faq: FAQ) => {
    setSelectedFAQ(faq);
    setSelectedTenantForMapping("");
    setMapToAllTenants(false);
    setShowMappingModal(true);
  };

  const confirmDelete = () => {
    if (selectedFAQ) {
      setFaqs((prev) => prev.filter((f) => f.id !== selectedFAQ.id));
      showToast("FAQ deleted successfully", "success");
    }
    setShowDeleteConfirm(false);
    setSelectedFAQ(null);
  };

  const saveFAQ = (isEdit: boolean) => {
    if (!formData.question.trim() || !formData.answer.trim()) {
      showToast("Please fill in both question and answer", "error");
      return;
    }

    if (isEdit && selectedFAQ) {
      setFaqs((prev) =>
        prev.map((f) =>
          f.id === selectedFAQ.id
            ? { ...f, ...formData, updated_at: new Date().toISOString() }
            : f
        )
      );
      showToast("FAQ updated successfully", "success");
      setShowEditModal(false);
    } else {
      const newFAQ: FAQ = {
        ...formData,
        id: generateId(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setFaqs((prev) => [...prev, newFAQ]);
      showToast("FAQ added successfully", "success");
      setShowAddModal(false);
    }
    setSelectedFAQ(null);
  };

  const saveMapping = () => {
    if (!selectedFAQ) return;

    const newMapping: FAQMapping = {
      faq_id: selectedFAQ.id,
      tenant_id: mapToAllTenants ? null : selectedTenantForMapping || null,
    };

    setFaqMappings((prev) => {
      // Remove existing mapping for this FAQ
      const filtered = prev.filter((m) => m.faq_id !== selectedFAQ.id);
      return [...filtered, newMapping];
    });

    showToast(
      mapToAllTenants
        ? "FAQ mapped to all tenants"
        : selectedTenantForMapping
          ? "FAQ mapped to selected tenant"
          : "FAQ mapping cleared",
      "success"
    );
    setShowMappingModal(false);
    setSelectedFAQ(null);
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      // Try to save to backend
      await axios.post(
        `${API_URL}/api/admin/faqs/bulk`,
        { faqs, mappings: faqMappings },
        { headers: getAuthHeaders() }
      );
      showToast("All FAQs saved successfully!", "success");
    } catch {
      // If endpoint doesn't exist, just show success (data is in state)
      showToast("FAQs saved to session (backend endpoint pending)", "info");
    } finally {
      setSaving(false);
    }
  };

  const getMappingInfo = (faqId: string) => {
    const mapping = faqMappings.find((m) => m.faq_id === faqId);
    if (!mapping) return null;
    if (mapping.tenant_id === null) return "All Tenants";
    const tenant = tenants.find((t) => t.tenant_id === mapping.tenant_id);
    return tenant?.corporate_legal_name || "Unknown Tenant";
  };

  const toggleFAQStatus = (faqId: string) => {
    setFaqs((prev) =>
      prev.map((f) => (f.id === faqId ? { ...f, is_active: !f.is_active } : f))
    );
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: `linear-gradient(135deg, ${colors.gray[50]}, ${colors.primaryLight})`,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              border: `4px solid ${colors.gray[200]}`,
              borderTopColor: colors.primary,
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 16px",
            }}
          />
          <p style={{ color: colors.gray[600] }}>Loading FAQs...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `linear-gradient(135deg, ${colors.gray[50]}, ${colors.primaryLight})`,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <AdminTopBar
        title="Master FAQ Management"
        subtitle="Manage frequently asked questions by country, category, and policy type"
        icon={<span style={{ fontSize: 24 }}>📚</span>}
        showBack={true}
      />

      {/* Main Content */}
      <main style={{ padding: "24px 32px", maxWidth: "1600px", margin: "0 auto", flex: 1 }}>
        {/* Action Bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: "16px",
          }}
        >
          <Button variant="success" icon="💾" onClick={handleSaveAll} loading={saving}>
            Save All to Database
          </Button>
        </div>

        {/* Stats Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          {[
            { label: "Total FAQs", value: faqs.length, icon: "📝", color: colors.primary },
            { label: "Active FAQs", value: faqs.filter((f) => f.is_active).length, icon: "✅", color: colors.success },
            { label: "Countries", value: new Set(faqs.map((f) => f.country)).size, icon: "🌍", color: colors.secondary },
            { label: "Mapped to Tenants", value: faqMappings.length, icon: "🔗", color: colors.warning },
          ].map((stat, i) => (
            <div
              key={i}
              style={{
                background: "white",
                borderRadius: "12px",
                padding: "20px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                border: `1px solid ${colors.gray[100]}`,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <p style={{ fontSize: "13px", color: colors.gray[500], margin: "0 0 4px" }}>
                    {stat.label}
                  </p>
                  <p style={{ fontSize: "28px", fontWeight: 700, color: stat.color, margin: 0 }}>
                    {stat.value}
                  </p>
                </div>
                <span style={{ fontSize: "28px" }}>{stat.icon}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div
          style={{
            background: "white",
            borderRadius: "16px",
            padding: "20px 24px",
            marginBottom: "20px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            border: `1px solid ${colors.gray[100]}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <span style={{ fontSize: "18px" }}>🔍</span>
            <h3 style={{ fontSize: "16px", fontWeight: 600, color: colors.gray[800], margin: 0 }}>
              Filter FAQs
            </h3>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 2fr", gap: "16px" }}>
            <Select
              label="Country"
              value={filterCountry}
              onChange={setFilterCountry}
              options={countries.map((c) => ({ value: c, label: c }))}
            />
            <Select
              label="Category"
              value={filterCategory}
              onChange={setFilterCategory}
              options={categories.map((c) => ({ value: c, label: c }))}
            />
            <Select
              label="Policy Type"
              value={filterPolicyType}
              onChange={setFilterPolicyType}
              options={[{ value: "", label: "All Policy Types" }, ...availablePolicyTypes]}
            />
            <Input
              label="Search"
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search questions or answers..."
            />
          </div>
        </div>

        {/* FAQ List Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: 600, color: colors.gray[800], margin: 0 }}>
              FAQs ({filteredFAQs.length})
            </h3>
            <p style={{ fontSize: "13px", color: colors.gray[500], margin: "4px 0 0" }}>
              {filterCountry !== "All Countries" && `${filterCountry} • `}
              {filterCategory !== "All Categories" && `${filterCategory}`}
            </p>
          </div>
          <Button variant="primary" icon="➕" onClick={handleAddFAQ}>
            Add New FAQ
          </Button>
        </div>

        {/* FAQ Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {filteredFAQs.length === 0 ? (
            <div
              style={{
                background: "white",
                borderRadius: "16px",
                padding: "60px 40px",
                textAlign: "center",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }}
            >
              <span style={{ fontSize: "48px", display: "block", marginBottom: "16px" }}>🔍</span>
              <h3 style={{ fontSize: "18px", fontWeight: 600, color: colors.gray[700], margin: "0 0 8px" }}>
                No FAQs Found
              </h3>
              <p style={{ fontSize: "14px", color: colors.gray[500], margin: "0 0 20px" }}>
                {searchQuery
                  ? "Try adjusting your search terms"
                  : "No FAQs match the selected filters. Try different filters or add a new FAQ."}
              </p>
              <Button variant="primary" icon="➕" onClick={handleAddFAQ}>
                Add First FAQ
              </Button>
            </div>
          ) : (
            filteredFAQs.map((faq, index) => (
              <div
                key={faq.id}
                style={{
                  background: "white",
                  borderRadius: "14px",
                  padding: "20px 24px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  border: `1px solid ${colors.gray[100]}`,
                  opacity: faq.is_active ? 1 : 0.6,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    {/* Question */}
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "12px" }}>
                      <span
                        style={{
                          background: colors.primaryLight,
                          color: colors.primary,
                          width: "28px",
                          height: "28px",
                          borderRadius: "8px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "14px",
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        Q
                      </span>
                      <h4 style={{ fontSize: "15px", fontWeight: 600, color: colors.gray[800], margin: 0 }}>
                        {faq.question}
                      </h4>
                    </div>

                    {/* Answer */}
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "16px" }}>
                      <span
                        style={{
                          background: "#dcfce7",
                          color: "#166534",
                          width: "28px",
                          height: "28px",
                          borderRadius: "8px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "14px",
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        A
                      </span>
                      <p style={{ fontSize: "14px", color: colors.gray[600], margin: 0, lineHeight: 1.6 }}>
                        {faq.answer}
                      </p>
                    </div>

                    {/* Tags */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      <Badge variant="primary">🌍 {faq.country}</Badge>
                      <Badge variant="default">📂 {faq.category}</Badge>
                      {faq.policy_type_name && <Badge variant="default">📋 {faq.policy_type_name}</Badge>}
                      <Badge variant={faq.is_active ? "success" : "warning"}>
                        {faq.is_active ? "Active" : "Inactive"}
                      </Badge>
                      {getMappingInfo(faq.id) && (
                        <Badge variant="primary">🔗 {getMappingInfo(faq.id)}</Badge>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: "8px", marginLeft: "20px" }}>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={faq.is_active ? "🔒" : "🔓"}
                      onClick={() => toggleFAQStatus(faq.id)}
                    >
                      {faq.is_active ? "Deactivate" : "Activate"}
                    </Button>
                    <Button variant="outline" size="sm" icon="🔗" onClick={() => handleMappingFAQ(faq)}>
                      Map
                    </Button>
                    <Button variant="outline" size="sm" icon="✏️" onClick={() => handleEditFAQ(faq)}>
                      Edit
                    </Button>
                    <Button variant="danger" size="sm" icon="🗑️" onClick={() => handleDeleteFAQ(faq)}>
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Add Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New FAQ" width="700px">
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <Select
              label="Country"
              value={formData.country}
              onChange={(v) => setFormData((prev) => ({ ...prev, country: v }))}
              options={countries.filter((c) => c !== "All Countries").map((c) => ({ value: c, label: c }))}
            />
            <Select
              label="Category"
              value={formData.category}
              onChange={(v) => setFormData((prev) => ({ ...prev, category: v }))}
              options={categories.filter((c) => c !== "All Categories").map((c) => ({ value: c, label: c }))}
            />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <Input
              label="Policy Type Code"
              value={formData.policy_type_code}
              onChange={(v) => setFormData((prev) => ({ ...prev, policy_type_code: v }))}
              placeholder="e.g., GROUP_HEALTH_IND"
            />
            <Input
              label="Policy Type Name"
              value={formData.policy_type_name}
              onChange={(v) => setFormData((prev) => ({ ...prev, policy_type_name: v }))}
              placeholder="e.g., Group Health Insurance"
            />
          </div>
          <Input
            label="Question"
            value={formData.question}
            onChange={(v) => setFormData((prev) => ({ ...prev, question: v }))}
            placeholder="Enter the FAQ question..."
          />
          <TextArea
            label="Answer"
            value={formData.answer}
            onChange={(v) => setFormData((prev) => ({ ...prev, answer: v }))}
            placeholder="Enter the detailed answer..."
            rows={5}
          />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "8px" }}>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" icon="➕" onClick={() => saveFAQ(false)}>
              Add FAQ
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit FAQ" width="700px">
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <Select
              label="Country"
              value={formData.country}
              onChange={(v) => setFormData((prev) => ({ ...prev, country: v }))}
              options={countries.filter((c) => c !== "All Countries").map((c) => ({ value: c, label: c }))}
            />
            <Select
              label="Category"
              value={formData.category}
              onChange={(v) => setFormData((prev) => ({ ...prev, category: v }))}
              options={categories.filter((c) => c !== "All Categories").map((c) => ({ value: c, label: c }))}
            />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <Input
              label="Policy Type Code"
              value={formData.policy_type_code}
              onChange={(v) => setFormData((prev) => ({ ...prev, policy_type_code: v }))}
              placeholder="e.g., GROUP_HEALTH_IND"
            />
            <Input
              label="Policy Type Name"
              value={formData.policy_type_name}
              onChange={(v) => setFormData((prev) => ({ ...prev, policy_type_name: v }))}
              placeholder="e.g., Group Health Insurance"
            />
          </div>
          <Input
            label="Question"
            value={formData.question}
            onChange={(v) => setFormData((prev) => ({ ...prev, question: v }))}
            placeholder="Enter the FAQ question..."
          />
          <TextArea
            label="Answer"
            value={formData.answer}
            onChange={(v) => setFormData((prev) => ({ ...prev, answer: v }))}
            placeholder="Enter the detailed answer..."
            rows={5}
          />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "8px" }}>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" icon="💾" onClick={() => saveFAQ(true)}>
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>

      {/* Mapping Modal */}
      <Modal isOpen={showMappingModal} onClose={() => setShowMappingModal(false)} title="Map FAQ to Tenant" width="500px">
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {selectedFAQ && (
            <div
              style={{
                background: colors.gray[50],
                padding: "16px",
                borderRadius: "10px",
                marginBottom: "8px",
              }}
            >
              <p style={{ fontSize: "13px", color: colors.gray[500], margin: "0 0 4px" }}>FAQ:</p>
              <p style={{ fontSize: "14px", fontWeight: 600, color: colors.gray[800], margin: 0 }}>
                {selectedFAQ.question}
              </p>
            </div>
          )}

          <div>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                cursor: "pointer",
                marginBottom: "16px",
              }}
            >
              <input
                type="checkbox"
                checked={mapToAllTenants}
                onChange={(e) => {
                  setMapToAllTenants(e.target.checked);
                  if (e.target.checked) setSelectedTenantForMapping("");
                }}
                style={{ width: "18px", height: "18px", cursor: "pointer" }}
              />
              <span style={{ fontSize: "14px", fontWeight: 500, color: colors.gray[700] }}>
                Map to ALL tenants (global FAQ)
              </span>
            </label>

            {!mapToAllTenants && (
              <Select
                label="Select Specific Tenant"
                value={selectedTenantForMapping}
                onChange={setSelectedTenantForMapping}
                placeholder="Choose a tenant..."
                options={tenants.map((t) => ({
                  value: t.tenant_id,
                  label: `${t.corporate_legal_name} (${t.subdomain})`,
                }))}
              />
            )}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
            <Button variant="outline" onClick={() => setShowMappingModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" icon="🔗" onClick={saveMapping}>
              Save Mapping
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Delete FAQ" width="450px">
        <div style={{ textAlign: "center" }}>
          <span style={{ fontSize: "48px", display: "block", marginBottom: "16px" }}>⚠️</span>
          <p style={{ fontSize: "15px", color: colors.gray[700], marginBottom: "8px" }}>
            Are you sure you want to delete this FAQ?
          </p>
          {selectedFAQ && (
            <p
              style={{
                fontSize: "14px",
                color: colors.gray[500],
                background: colors.gray[50],
                padding: "12px",
                borderRadius: "8px",
                marginBottom: "20px",
              }}
            >
              &quot;{selectedFAQ.question}&quot;
            </p>
          )}
          <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button variant="danger" icon="🗑️" onClick={confirmDelete}>
              Delete FAQ
            </Button>
          </div>
        </div>
      </Modal>

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <AdminFooter />
    </div>
  );
}
