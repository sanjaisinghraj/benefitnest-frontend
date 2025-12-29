"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import AdminTopBar from "../components/AdminTopBar";
import AdminFooter from "../components/AdminFooter";

const API_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "https://benefitnest-backend.onrender.com";
const colors = {
  primary: "#6366f1",
  primaryHover: "#4f46e5",
  primaryLight: "#e0e7ff",
  primaryDark: "#3730a3",
  secondary: "#8b5cf6",
  success: "#10b981",
  successLight: "#d1fae5",
  danger: "#ef4444",
  dangerLight: "#fee2e2",
  warning: "#f59e0b",
  warningLight: "#fef3c7",
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

const FONTS = [
  { name: "Inter", cat: "Sans-serif", mood: "Modern, Clean" },
  { name: "Roboto", cat: "Sans-serif", mood: "Versatile" },
  { name: "Open Sans", cat: "Sans-serif", mood: "Readable" },
  { name: "Poppins", cat: "Sans-serif", mood: "Geometric" },
  { name: "Montserrat", cat: "Sans-serif", mood: "Bold" },
  { name: "Lato", cat: "Sans-serif", mood: "Warm" },
  { name: "Playfair Display", cat: "Serif", mood: "Elegant" },
  { name: "Merriweather", cat: "Serif", mood: "Traditional" },
  { name: "Lora", cat: "Serif", mood: "Balanced" },
  { name: "Segoe UI", cat: "System", mood: "Windows" },
  { name: "Arial", cat: "System", mood: "Universal" },
];

const INDUSTRY_AI: Record<
  string,
  {
    c: { p: string; s: string; a: string };
    f: { h: string; b: string };
    t: string;
  }
> = {
  healthcare: {
    c: { p: "#0891b2", s: "#14b8a6", a: "#f59e0b" },
    f: { h: "Nunito", b: "Open Sans" },
    t: "Trust & Care",
  },
  finance: {
    c: { p: "#1e40af", s: "#3b82f6", a: "#eab308" },
    f: { h: "Playfair Display", b: "Lato" },
    t: "Stability",
  },
  technology: {
    c: { p: "#6366f1", s: "#8b5cf6", a: "#06b6d4" },
    f: { h: "Inter", b: "Inter" },
    t: "Innovation",
  },
  retail: {
    c: { p: "#dc2626", s: "#f97316", a: "#fbbf24" },
    f: { h: "Poppins", b: "Lato" },
    t: "Energy",
  },
  manufacturing: {
    c: { p: "#374151", s: "#6b7280", a: "#f59e0b" },
    f: { h: "Montserrat", b: "Open Sans" },
    t: "Reliability",
  },
  education: {
    c: { p: "#059669", s: "#10b981", a: "#3b82f6" },
    f: { h: "Merriweather", b: "Open Sans" },
    t: "Knowledge",
  },
  default: {
    c: { p: "#2563eb", s: "#10b981", a: "#f59e0b" },
    f: { h: "Inter", b: "Open Sans" },
    t: "Professional",
  },
};

interface Corporate {
  tenant_id: string;
  corporate_legal_name: string;
  subdomain: string;
  primary_color?: string;
  secondary_color?: string;
  status?: string;
  industry_type?: string;
  contact_details?: { email?: string; phone?: string };
  logo_url?: string;
}
interface Customizations {
  [key: string]: any;
}
interface Tester {
  id: string;
  email: string;
  password_hash: string;
  display_name?: string;
  is_active: boolean;
  created_at: string;
}

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

// Components
const Button = ({
  children,
  variant = "primary",
  size = "md",
  icon,
  onClick,
  disabled,
  loading,
  style = {},
}: any) => {
  const v: any = {
    primary: { bg: colors.primary, c: "white" },
    success: { bg: colors.success, c: "white" },
    outline: {
      bg: "transparent",
      c: colors.gray[700],
      border: `2px solid ${colors.gray[300]}`,
    },
    ai: { bg: "linear-gradient(135deg,#6366f1,#8b5cf6)", c: "white" },
    magic: {
      bg: "linear-gradient(135deg,#f59e0b,#ef4444,#ec4899)",
      c: "white",
    },
  };
  const s: any = {
    xs: "6px 10px",
    sm: "8px 14px",
    md: "10px 18px",
    lg: "14px 24px",
  };
  const vs = v[variant] || v.primary;
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        padding: s[size] || s.md,
        fontSize:
          size === "xs"
            ? "11px"
            : size === "sm"
              ? "12px"
              : size === "lg"
                ? "16px"
                : "14px",
        fontWeight: "600",
        color: vs.c,
        background: vs.bg,
        border: vs.border || "none",
        borderRadius: "10px",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        boxShadow:
          variant === "ai" || variant === "magic"
            ? "0 4px 15px rgba(99,102,241,0.4)"
            : "none",
        ...style,
      }}
    >
      {loading ? (
        <span
          style={{
            width: "16px",
            height: "16px",
            border: "2px solid transparent",
            borderTopColor: "currentColor",
            borderRadius: "50%",
            animation: "spin 0.6s linear infinite",
          }}
        />
      ) : icon ? (
        <span>{icon}</span>
      ) : null}
      {children}
    </button>
  );
};
const Badge = ({ children, variant = "default" }: any) => {
  const v: any = {
    default: { bg: colors.gray[100], c: colors.gray[700] },
    success: { bg: colors.successLight, c: "#065f46" },
    warning: { bg: colors.warningLight, c: "#92400e" },
  };
  const vs = v[variant] || v.default;
  return (
    <span
      style={{
        padding: "4px 12px",
        borderRadius: "6px",
        fontSize: "11px",
        fontWeight: "600",
        backgroundColor: vs.bg,
        color: vs.c,
      }}
    >
      {children}
    </span>
  );
};
const Toast = ({ message, type, onClose }: any) => {
  useEffect(() => {
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [onClose]);
  const t: any = {
    success: { bg: colors.successLight, c: "#065f46", icon: "✓" },
    error: { bg: colors.dangerLight, c: "#991b1b", icon: "✕" },
    ai: { bg: colors.primaryLight, c: colors.primaryDark, icon: "🤖" },
  };
  const ts = t[type] || t.success;
  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        background: ts.bg,
        color: ts.c,
        padding: "16px 20px",
        borderRadius: "12px",
        boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        zIndex: 2000,
      }}
    >
      <span style={{ fontSize: "20px" }}>{ts.icon}</span>
      <span style={{ fontSize: "14px", fontWeight: "500" }}>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: "none",
          border: "none",
          color: ts.c,
          cursor: "pointer",
          fontSize: "18px",
        }}
      >
        ×
      </button>
    </div>
  );
};
const Modal = ({
  isOpen,
  onClose,
  title,
  icon,
  children,
  size = "md",
}: any) => {
  if (!isOpen) return null;
  const s: any = { sm: "480px", md: "640px", lg: "900px", xl: "1200px" };
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px",
        backdropFilter: "blur(4px)",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "20px",
          width: "100%",
          maxWidth: s[size],
          maxHeight: "90vh",
          overflow: "hidden",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            padding: "20px 24px",
            borderBottom: `1px solid ${colors.gray[200]}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: colors.gray[50],
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {icon && <span style={{ fontSize: "24px" }}>{icon}</span>}
            <h2 style={{ fontSize: "18px", fontWeight: "700", margin: 0 }}>
              {title}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              border: "none",
              backgroundColor: colors.gray[200],
              cursor: "pointer",
              fontSize: "20px",
            }}
          >
            ×
          </button>
        </div>
        <div style={{ padding: "24px", overflowY: "auto", flex: 1 }}>
          {children}
        </div>
      </div>
    </div>
  );
};
const Input = ({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  hint,
  icon,
}: any) => (
  <div style={{ marginBottom: "16px" }}>
    {label && (
      <label
        style={{
          display: "block",
          marginBottom: "6px",
          fontSize: "13px",
          fontWeight: "600",
          color: colors.gray[700],
        }}
      >
        {label}
      </label>
    )}
    <div style={{ position: "relative" }}>
      {icon && (
        <span
          style={{
            position: "absolute",
            left: "14px",
            top: "50%",
            transform: "translateY(-50%)",
            fontSize: "16px",
            color: colors.gray[400],
          }}
        >
          {icon}
        </span>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: icon ? "12px 14px 12px 42px" : "12px 14px",
          border: `2px solid ${colors.gray[200]}`,
          borderRadius: "10px",
          fontSize: "14px",
          outline: "none",
          boxSizing: "border-box",
        }}
      />
    </div>
    {hint && (
      <div
        style={{ fontSize: "11px", color: colors.gray[500], marginTop: "4px" }}
      >
        {hint}
      </div>
    )}
  </div>
);
const ColorPicker = ({ label, value, onChange }: any) => {
  const [show, setShow] = useState(false);
  const presets = [
    "#6366f1",
    "#8b5cf6",
    "#ec4899",
    "#ef4444",
    "#f59e0b",
    "#10b981",
    "#06b6d4",
    "#3b82f6",
    "#1f2937",
  ];
  return (
    <div style={{ marginBottom: "16px" }}>
      {label && (
        <label
          style={{
            display: "block",
            marginBottom: "6px",
            fontSize: "13px",
            fontWeight: "600",
            color: colors.gray[700],
          }}
        >
          {label}
        </label>
      )}
      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <input
          type="color"
          value={value || "#6366f1"}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: "50px",
            height: "44px",
            border: `2px solid ${colors.gray[200]}`,
            borderRadius: "10px",
            cursor: "pointer",
            padding: "2px",
          }}
        />
        <input
          type="text"
          value={value || "#6366f1"}
          onChange={(e) => onChange(e.target.value)}
          style={{
            flex: 1,
            padding: "12px",
            border: `2px solid ${colors.gray[200]}`,
            borderRadius: "10px",
            fontSize: "14px",
            fontFamily: "monospace",
            outline: "none",
          }}
        />
        <button
          onClick={() => setShow(!show)}
          style={{
            padding: "12px",
            border: `2px solid ${colors.gray[200]}`,
            borderRadius: "10px",
            backgroundColor: "white",
            cursor: "pointer",
          }}
        >
          🎨
        </button>
      </div>
      {show && (
        <div
          style={{
            marginTop: "8px",
            padding: "12px",
            backgroundColor: colors.gray[50],
            borderRadius: "10px",
            display: "flex",
            gap: "6px",
            flexWrap: "wrap",
          }}
        >
          {presets.map((c) => (
            <div
              key={c}
              onClick={() => {
                onChange(c);
                setShow(false);
              }}
              style={{
                width: "28px",
                height: "28px",
                backgroundColor: c,
                borderRadius: "6px",
                cursor: "pointer",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
const FontSelector = ({ label, value, onChange }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const filtered = useMemo(
    () =>
      search
        ? FONTS.filter((f) =>
            f.name.toLowerCase().includes(search.toLowerCase()),
          )
        : FONTS,
    [search],
  );
  return (
    <div style={{ marginBottom: "16px", position: "relative" }}>
      {label && (
        <label
          style={{
            display: "block",
            marginBottom: "6px",
            fontSize: "13px",
            fontWeight: "600",
            color: colors.gray[700],
          }}
        >
          {label}
        </label>
      )}
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: "12px 14px",
          border: `2px solid ${isOpen ? colors.primary : colors.gray[200]}`,
          borderRadius: "10px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "white",
        }}
      >
        <span style={{ fontFamily: value || "inherit", fontSize: "14px" }}>
          {value || "Select font..."}
        </span>
        <span
          style={{
            transform: isOpen ? "rotate(180deg)" : "none",
            transition: "transform 0.2s",
            color: colors.gray[400],
          }}
        >
          ▼
        </span>
      </div>
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            backgroundColor: "white",
            border: `2px solid ${colors.gray[200]}`,
            borderRadius: "12px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
            zIndex: 100,
            marginTop: "4px",
            maxHeight: "280px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "10px",
              borderBottom: `1px solid ${colors.gray[100]}`,
            }}
          >
            <input
              type="text"
              placeholder="🔍 Search fonts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "100%",
                padding: "10px",
                border: `1px solid ${colors.gray[200]}`,
                borderRadius: "8px",
                fontSize: "13px",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
          <div style={{ maxHeight: "200px", overflowY: "auto" }}>
            {filtered.map((font) => (
              <div
                key={font.name}
                onClick={() => {
                  onChange(font.name);
                  setIsOpen(false);
                  setSearch("");
                }}
                style={{
                  padding: "12px 16px",
                  cursor: "pointer",
                  borderBottom: `1px solid ${colors.gray[50]}`,
                  backgroundColor:
                    value === font.name ? colors.primaryLight : "white",
                }}
                onMouseEnter={(e) => {
                  if (value !== font.name)
                    e.currentTarget.style.backgroundColor = colors.gray[50];
                }}
                onMouseLeave={(e) => {
                  if (value !== font.name)
                    e.currentTarget.style.backgroundColor = "white";
                }}
              >
                <div
                  style={{
                    fontFamily: font.name,
                    fontSize: "15px",
                    fontWeight: "600",
                    marginBottom: "2px",
                  }}
                >
                  {font.name}
                </div>
                <div style={{ fontSize: "11px", color: colors.gray[500] }}>
                  {font.cat} • {font.mood}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
const Toggle = ({ label, value, onChange, description }: any) => (
  <div
    onClick={() => onChange(!value)}
    style={{
      display: "flex",
      alignItems: "flex-start",
      gap: "14px",
      padding: "14px 16px",
      backgroundColor: value ? colors.primaryLight : colors.gray[50],
      borderRadius: "12px",
      cursor: "pointer",
      border: `2px solid ${value ? colors.primary : "transparent"}`,
      marginBottom: "10px",
    }}
  >
    <div
      style={{
        width: "48px",
        height: "26px",
        borderRadius: "13px",
        backgroundColor: value ? colors.primary : colors.gray[300],
        position: "relative",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: "22px",
          height: "22px",
          borderRadius: "50%",
          backgroundColor: "white",
          position: "absolute",
          top: "2px",
          left: value ? "24px" : "2px",
          transition: "all 0.2s",
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        }}
      />
    </div>
    <div>
      <div
        style={{ fontSize: "14px", fontWeight: "600", color: colors.gray[800] }}
      >
        {label}
      </div>
      {description && (
        <div
          style={{
            fontSize: "12px",
            color: colors.gray[500],
            marginTop: "2px",
          }}
        >
          {description}
        </div>
      )}
    </div>
  </div>
);

// Live Preview - Matches actual [subdomain]/page.tsx login design
const LivePreview = ({
  customizations: c,
  corporate,
  previewMode,
  forceLoginPage = false,
}: any) => {
  const [consentChecked, setConsentChecked] = useState(false);

  const theme = {
    primary: c.primary_color || "#db2777",
    secondary: c.secondary_color || "#9333ea",
    accent: c.accent_color || "#f59e0b",
    background: c.background_color || "#ffffff",
    text: c.text_color || "#111827",
    border: c.border_color || "#e5e7eb",
    headingFont: c.heading_font_family || "Segoe UI",
    bodyFont: c.body_font_family || "Segoe UI",
    logoUrl: c.logo_url || corporate?.logo_url,
    logoWidth: c.logo_width || 150,
    logoHeight: c.logo_height || 50,
    headingWeight: c.font_weight_heading || 700,
  };

  const content = {
    title:
      c.portal_title || corporate?.corporate_legal_name || "Employee Portal",
    tagline:
      c.portal_tagline ||
      "To keep connected with us please login with your personal info",
    heroHeadline: c.hero_headline || "Welcome to Your Benefits",
    heroSubheadline: c.hero_subheadline || "Everything you need in one place",
    heroCtaText: c.hero_cta_button_text || "Get Started",
  };

  const loginVis = {
    consent: c.show_consent_checkbox !== false,
    privacy: c.show_privacy_link !== false,
    terms: c.show_terms_link !== false,
    disclaimer: c.show_disclaimer_link !== false,
    rememberMe: c.show_remember_me !== false,
    forgotPassword: c.show_forgot_password !== false,
    loginMethodSelector: c.show_login_method_selector !== false,
    otpLogin: c.enable_otp_login !== false,
  };

  // Dashboard Preview - Show when "Dashboard" button is selected (forceLoginPage = false)
  if (!forceLoginPage) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
          fontFamily: theme.bodyFont,
          padding: "12px",
          overflow: "auto",
        }}
      >
        <div
          style={{
            backgroundColor: theme.background,
            borderRadius: "16px",
            padding: "16px",
            minHeight: "calc(100% - 24px)",
            boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "16px",
              paddingBottom: "12px",
              borderBottom: `1px solid ${theme.border}`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {theme.logoUrl ? (
                <img
                  src={theme.logoUrl}
                  alt="Logo"
                  style={{ maxHeight: "24px", objectFit: "contain" }}
                  onError={(e: any) => {
                    e.target.style.display = "none";
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: "12px",
                  }}
                >
                  🏢
                </div>
              )}
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: "700",
                  color: theme.text,
                  fontFamily: theme.headingFont,
                }}
              >
                {content.title}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: "#10b981",
                }}
              />
              <span
                style={{ fontSize: "9px", color: theme.text, opacity: 0.7 }}
              >
                Online
              </span>
            </div>
          </div>

          {/* Welcome */}
          <div style={{ marginBottom: "16px" }}>
            <h2
              style={{
                fontSize: "14px",
                fontWeight: theme.headingWeight,
                color: theme.text,
                margin: "0 0 4px 0",
                fontFamily: theme.headingFont,
              }}
            >
              👋 Welcome back!
            </h2>
            <p
              style={{
                fontSize: "10px",
                color: theme.text,
                opacity: 0.6,
                margin: 0,
              }}
            >
              Here&apos;s your benefits overview
            </p>
          </div>

          {/* Feature Tiles */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "8px",
            }}
          >
            {[
              { icon: "🧘", title: "Wellness", color: "#10b981" },
              { icon: "🛍️", title: "Marketplace", color: "#6366f1" },
              { icon: "🏥", title: "Health Plans", color: "#0891b2" },
              { icon: "📋", title: "Claims", color: "#f59e0b" },
            ].map((tile, i) => (
              <div
                key={i}
                style={{
                  padding: "12px",
                  borderRadius: "10px",
                  background: `${tile.color}10`,
                  border: `1px solid ${tile.color}30`,
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "20px", marginBottom: "4px" }}>
                  {tile.icon}
                </div>
                <div
                  style={{
                    fontSize: "10px",
                    fontWeight: "600",
                    color: tile.color,
                  }}
                >
                  {tile.title}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Login Page Preview - Two-panel design matching actual portal
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: `linear-gradient(135deg, ${theme.primary}15, ${theme.secondary}15)`,
        fontFamily: theme.bodyFont,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "8px",
        overflow: "hidden",
      }}
    >
      {/* Main Container - Two Panel Layout */}
      <div
        style={{
          width: "100%",
          maxWidth: "100%",
          height: "100%",
          display: "flex",
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
          backgroundColor: "white",
        }}
      >
        {/* Left Panel - Gradient with Welcome */}
        <div
          style={{
            width: "40%",
            background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: "16px 12px",
            overflow: "hidden",
          }}
        >
          {/* Decorative Elements */}
          <div
            style={{
              position: "absolute",
              top: "-30px",
              left: "-30px",
              width: "100px",
              height: "100px",
              background: "rgba(255,255,255,0.08)",
              borderRadius: "60% 40% 30% 70%",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "10%",
              left: "5%",
              width: "40px",
              height: "40px",
              border: "2px solid rgba(255,255,255,0.15)",
              borderRadius: "50%",
            }}
          />

          {/* Content */}
          <div
            style={{
              position: "relative",
              zIndex: 10,
              textAlign: "center",
              color: "white",
            }}
          >
            {theme.logoUrl ? (
              <img
                src={theme.logoUrl}
                alt="Logo"
                style={{
                  maxWidth: "60px",
                  maxHeight: "30px",
                  marginBottom: "12px",
                  objectFit: "contain",
                }}
                onError={(e: any) => {
                  e.target.style.display = "none";
                }}
              />
            ) : (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  marginBottom: "12px",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    width: "24px",
                    height: "24px",
                    backgroundColor: "rgba(255,255,255,0.2)",
                    borderRadius: "6px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12px",
                  }}
                >
                  🏢
                </div>
              </div>
            )}
            <h1
              style={{
                fontSize: "16px",
                fontWeight: theme.headingWeight,
                marginBottom: "6px",
                fontFamily: theme.headingFont,
                lineHeight: 1.2,
              }}
            >
              Welcome Back
            </h1>
            <p
              style={{
                fontSize: "9px",
                opacity: 0.85,
                lineHeight: 1.4,
                maxWidth: "120px",
                margin: "0 auto",
              }}
            >
              {content.tagline}
            </p>
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div
          style={{
            flex: 1,
            backgroundColor: "#f8f4ff",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "16px 14px",
            overflow: "auto",
          }}
        >
          {/* Decorative confetti */}
          <div
            style={{
              position: "absolute",
              top: "10%",
              right: "15%",
              width: "6px",
              height: "6px",
              backgroundColor: theme.primary,
              opacity: 0.3,
              borderRadius: "1px",
              transform: "rotate(45deg)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "20%",
              left: "10%",
              width: "8px",
              height: "8px",
              backgroundColor: theme.secondary,
              opacity: 0.2,
              borderRadius: "50%",
            }}
          />

          <div style={{ position: "relative", zIndex: 10 }}>
            <h2
              style={{
                fontSize: "14px",
                fontWeight: theme.headingWeight,
                color: theme.text,
                marginBottom: "4px",
                fontFamily: theme.headingFont,
              }}
            >
              Sign In
            </h2>
            <p
              style={{
                fontSize: "9px",
                color: theme.text,
                opacity: 0.5,
                marginBottom: "12px",
              }}
            >
              Access your employee benefits portal
            </p>

            {/* Login Method Selector */}
            {loginVis.loginMethodSelector && (
              <div style={{ marginBottom: "10px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "8px",
                    fontWeight: "600",
                    color: theme.text,
                    marginBottom: "3px",
                    opacity: 0.7,
                  }}
                >
                  Login With
                </label>
                <select
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    border: `1.5px solid ${theme.border}`,
                    borderRadius: "8px",
                    fontSize: "10px",
                    backgroundColor: "white",
                    cursor: "pointer",
                    color: theme.text,
                  }}
                >
                  <option>Registered Email</option>
                  <option>Mobile Number</option>
                  <option>Employee ID</option>
                </select>
              </div>
            )}

            {/* Email Input */}
            <div style={{ marginBottom: "10px" }}>
              <input
                type="email"
                placeholder="Enter your email"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: `1.5px solid ${theme.border}`,
                  borderRadius: "8px",
                  fontSize: "10px",
                  boxSizing: "border-box",
                  backgroundColor: "white",
                }}
              />
            </div>

            {/* Password Input */}
            <div style={{ marginBottom: "10px" }}>
              <input
                type="password"
                placeholder="Password"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: `1.5px solid ${theme.border}`,
                  borderRadius: "8px",
                  fontSize: "10px",
                  boxSizing: "border-box",
                  backgroundColor: "white",
                }}
              />
            </div>

            {/* Remember Me & Forgot Password */}
            {(loginVis.rememberMe || loginVis.forgotPassword) && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "10px",
                  fontSize: "8px",
                }}
              >
                {loginVis.rememberMe && (
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      color: theme.text,
                      opacity: 0.7,
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      style={{
                        accentColor: theme.primary,
                        width: "10px",
                        height: "10px",
                      }}
                    />
                    Remember me
                  </label>
                )}
                {loginVis.forgotPassword && (
                  <span
                    style={{
                      color: theme.primary,
                      fontWeight: "600",
                      cursor: "pointer",
                    }}
                  >
                    Forgot password?
                  </span>
                )}
              </div>
            )}

            {/* Consent Checkbox */}
            {loginVis.consent && (
              <div
                style={{
                  marginBottom: "10px",
                  padding: "8px",
                  backgroundColor: `${theme.primary}08`,
                  borderRadius: "8px",
                  border: `1px solid ${theme.primary}15`,
                }}
              >
                <label
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "6px",
                    fontSize: "8px",
                    color: theme.text,
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={consentChecked}
                    onChange={(e) => setConsentChecked(e.target.checked)}
                    style={{
                      accentColor: theme.primary,
                      marginTop: "1px",
                      width: "10px",
                      height: "10px",
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ lineHeight: 1.4 }}>
                    I agree to the{" "}
                    {loginVis.privacy && (
                      <span style={{ color: theme.primary, fontWeight: "600" }}>
                        Privacy Policy
                      </span>
                    )}
                    {loginVis.privacy && loginVis.terms && ", "}
                    {loginVis.terms && (
                      <span style={{ color: theme.primary, fontWeight: "600" }}>
                        Terms & Conditions
                      </span>
                    )}
                    {loginVis.disclaimer && (
                      <>
                        {" "}
                        and{" "}
                        <span
                          style={{ color: theme.primary, fontWeight: "600" }}
                        >
                          Disclaimer
                        </span>
                      </>
                    )}
                  </span>
                </label>
              </div>
            )}

            {/* Sign In Button */}
            <button
              style={{
                width: "100%",
                padding: "10px",
                background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "11px",
                fontWeight: "600",
                cursor: "default",
                boxShadow: `0 8px 20px -8px ${theme.primary}60`,
                marginBottom: loginVis.otpLogin ? "8px" : "0",
              }}
            >
              Sign In
            </button>

            {/* OTP Login Button */}
            {loginVis.otpLogin && (
              <button
                style={{
                  width: "100%",
                  padding: "8px",
                  background: "transparent",
                  color: theme.primary,
                  border: `1.5px solid ${theme.primary}40`,
                  borderRadius: "8px",
                  fontSize: "9px",
                  fontWeight: "600",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "4px",
                }}
              >
                📱 Sign in with OTP
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Component
export default function PortalCustomizationPage() {
  // Preview type: 'login' or 'main'
  const [previewType, setPreviewType] = useState<"login" | "main">("main");
  const router = useRouter();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [corporates, setCorporates] = useState<Corporate[]>([]);
  const [selectedCorporate, setSelectedCorporate] = useState<Corporate | null>(
    null,
  );
  const [customizations, setCustomizations] = useState<Customizations>({});
  const [originalCustomizations, setOriginalCustomizations] =
    useState<Customizations>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: string } | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [activeTab, setActiveTab] = useState("branding");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewMode, setPreviewMode] = useState<"mini" | "full">("mini");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiLogs, setAiLogs] = useState<string[]>([]);
  const [showAiModal, setShowAiModal] = useState(false);
  const [showAiConfirmModal, setShowAiConfirmModal] = useState(false);
  const [aiDiscoveryResults, setAiDiscoveryResults] = useState<{
    found: boolean;
    companyInfo: any;
    suggestedSettings: any;
    searchSources: string[];
    confidenceScore?: number;
    aiPowered?: boolean;
  } | null>(null);
  const [aiSearching, setAiSearching] = useState(false);
  const [showTesterModal, setShowTesterModal] = useState(false);
  const [testers, setTesters] = useState<Tester[]>([]);
  const [loadingTesters, setLoadingTesters] = useState(false);
  const [newTesterEmail, setNewTesterEmail] = useState("");
  const [newTesterPassword, setNewTesterPassword] = useState("");
  const [newTesterName, setNewTesterName] = useState("");
  const [addingTester, setAddingTester] = useState(false);

  useEffect(() => {
    fetchCorporates();
  }, []);
  useEffect(() => {
    if (selectedCorporate)
      setHasUnsavedChanges(
        JSON.stringify(customizations) !==
          JSON.stringify(originalCustomizations),
      );
  }, [customizations, originalCustomizations, selectedCorporate]);

  const fetchCorporates = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${API_URL}/api/admin/corporates?limit=1000`,
        { headers: getAuthHeaders() },
      );
      setCorporates(res.data.data || []);
    } catch {
      showToast("Failed to load corporates", "error");
    } finally {
      setLoading(false);
    }
  };
  const handleCorporateSelect = async (corp: Corporate) => {
    if (hasUnsavedChanges && !confirm("Discard unsaved changes?")) return;
    setSelectedCorporate(corp);
    setActiveTab("branding");
    try {
      setLoading(true);
      const res = await axios.get(
        `${API_URL}/api/admin/corporates/${corp.tenant_id}/customizations`,
        { headers: getAuthHeaders() },
      );
      const data = res.data.data || {};
      setCustomizations(data);
      setOriginalCustomizations(data);
    } catch {
      setCustomizations({});
      setOriginalCustomizations({});
    } finally {
      setLoading(false);
    }
  };
  const handleSave = async () => {
    if (!selectedCorporate) return;
    try {
      setSaving(true);
      const res = await axios.post(
        `${API_URL}/api/admin/corporates/${selectedCorporate.tenant_id}/customize-portal`,
        customizations,
        { headers: getAuthHeaders() },
      );
      if (res.data.success) {
        showToast("✨ Design saved! Portal updated.", "success");
        setOriginalCustomizations(customizations);
        setHasUnsavedChanges(false);
      }
    } catch {
      showToast("Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleAIMagic = async () => {
    if (!selectedCorporate) return;
    setAiSearching(true);
    setShowAiConfirmModal(true);
    setAiDiscoveryResults(null);

    try {
      // Call backend AI Brand Discovery endpoint (uses Groq)
      const res = await axios.post(
        `${API_URL}/api/admin/ai-brand-discovery`,
        {
          companyName: selectedCorporate.corporate_legal_name,
          industryType: selectedCorporate.industry_type,
          subdomain: selectedCorporate.subdomain,
          existingLogo: selectedCorporate.logo_url,
        },
        { headers: getAuthHeaders() },
      );

      if (res.data.success) {
        const data = res.data.data;
        setAiDiscoveryResults({
          found: data.found,
          companyInfo: data.companyInfo,
          suggestedSettings: data.suggestedSettings,
          searchSources: data.searchSources,
          confidenceScore: data.confidenceScore,
          aiPowered: data.aiPowered,
        });
      } else {
        throw new Error(res.data.message || "AI discovery failed");
      }
    } catch (error) {
      console.error("AI Brand Discovery error:", error);
      // Fallback to local industry-based defaults
      const industry =
        selectedCorporate.industry_type?.toLowerCase() || "default";
      const data = INDUSTRY_AI[industry] || INDUSTRY_AI.default;

      setAiDiscoveryResults({
        found: false,
        companyInfo: { name: selectedCorporate.corporate_legal_name },
        suggestedSettings: {
          primary_color: data.c.p,
          secondary_color: data.c.s,
          accent_color: data.c.a,
          heading_font_family: data.f.h,
          body_font_family: data.f.b,
          portal_title: `${selectedCorporate.corporate_legal_name} Benefits`,
          portal_tagline: `Your ${data.t} Partner`,
          hero_headline: `Welcome to ${selectedCorporate.corporate_legal_name}`,
          hero_subheadline: `Access your complete benefits with ease`,
          logo_url: selectedCorporate.logo_url,
          theme: data.t,
          industry: industry,
        },
        searchSources: ["Local Industry Defaults"],
        confidenceScore: 50,
        aiPowered: false,
      });
    } finally {
      setAiSearching(false);
    }
  };

  const applyAISettings = (useDefaults = false) => {
    if (!selectedCorporate) return;
    setShowAiConfirmModal(false);
    setAiLoading(true);
    setShowAiModal(true);
    setAiLogs(["🚀 Applying brand settings..."]);

    const industry =
      selectedCorporate.industry_type?.toLowerCase() || "default";
    const data = INDUSTRY_AI[industry] || INDUSTRY_AI.default;
    const settings = aiDiscoveryResults?.suggestedSettings;

    const logs = [
      `🔍 Corporate: ${selectedCorporate.corporate_legal_name}`,
      `📊 Industry: ${industry !== "default" ? industry : "General (using defaults)"}`,
      `🎨 Applying ${data.t} color palette`,
      `📝 Setting ${data.f.h} + ${data.f.b} fonts`,
      useDefaults
        ? "⚙️ Using default professional settings"
        : "✨ Applied discovered brand settings",
      `✅ Complete! Confidence: ${aiDiscoveryResults?.found ? 85 : 65}%`,
    ];

    (async () => {
      for (const log of logs) {
        await new Promise((r) => setTimeout(r, 400));
        setAiLogs((prev) => [...prev, log]);
      }

      if (settings && !useDefaults) {
        setCustomizations((prev) => ({ ...prev, ...settings }));
      } else {
        // Apply defaults
        setCustomizations((prev) => ({
          ...prev,
          primary_color: data.c.p,
          secondary_color: data.c.s,
          accent_color: data.c.a,
          heading_font_family: data.f.h,
          body_font_family: data.f.b,
          portal_title: `${selectedCorporate.corporate_legal_name} Benefits`,
          portal_tagline: `Your ${data.t} Partner`,
          hero_headline: `Welcome to ${selectedCorporate.corporate_legal_name}`,
          hero_subheadline: `Access your complete benefits with ease`,
          logo_url: selectedCorporate.logo_url,
        }));
      }

      showToast("🤖 AI configured your portal!", "ai");
      setAiLoading(false);
    })();
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    document.cookie = "admin_token=; path=/; max-age=0";
    window.location.href = "https://www.benefitnest.space";
  };
  const showToast = (message: string, type: string) =>
    setToast({ message, type });

  const fetchTesters = async (tenantId: string) => {
    try {
      setLoadingTesters(true);
      const res = await axios.get(
        `${API_URL}/api/admin/corporates/${tenantId}/testers`,
        { headers: getAuthHeaders() },
      );
      if (res.data.success) {
        setTesters(res.data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch testers:", err);
      setTesters([]);
    } finally {
      setLoadingTesters(false);
    }
  };

  const handleAddTester = async () => {
    if (!selectedCorporate || !newTesterEmail || !newTesterPassword) {
      showToast("Email and password are required", "error");
      return;
    }
    try {
      setAddingTester(true);
      const res = await axios.post(
        `${API_URL}/api/admin/corporates/${selectedCorporate.tenant_id}/testers`,
        {
          email: newTesterEmail,
          password: newTesterPassword,
          display_name: newTesterName || newTesterEmail.split("@")[0],
        },
        { headers: getAuthHeaders() },
      );

      if (res.data.success) {
        showToast("Tester added successfully!", "success");
        setNewTesterEmail("");
        setNewTesterPassword("");
        setNewTesterName("");
        fetchTesters(selectedCorporate.tenant_id);
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed to add tester", "error");
    } finally {
      setAddingTester(false);
    }
  };

  const handleDeleteTester = async (testerId: string) => {
    if (!selectedCorporate || !confirm("Delete this tester?")) return;
    try {
      await axios.delete(
        `${API_URL}/api/admin/corporates/${selectedCorporate.tenant_id}/testers/${testerId}`,
        { headers: getAuthHeaders() },
      );
      showToast("Tester deleted", "success");
      fetchTesters(selectedCorporate.tenant_id);
    } catch (err) {
      showToast("Failed to delete tester", "error");
    }
  };

  const handleVisitLive = () => {
    if (!selectedCorporate) return;
    fetchTesters(selectedCorporate.tenant_id);
    setShowTesterModal(true);
  };

  const updateCustomization = (key: string, value: any) =>
    setCustomizations((prev) => ({ ...prev, [key]: value }));
  const filteredCorporates = useMemo(
    () =>
      searchQuery.trim()
        ? corporates.filter(
            (c) =>
              c.corporate_legal_name
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
              c.subdomain.toLowerCase().includes(searchQuery.toLowerCase()),
          )
        : [],
    [corporates, searchQuery],
  );
  const paginatedCorporates = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCorporates.slice(start, start + itemsPerPage);
  }, [filteredCorporates, currentPage]);
  const totalPages = Math.ceil(filteredCorporates.length / itemsPerPage);
  const tabs = [
    { id: "branding", label: "Branding", icon: "🎨" },
    { id: "typography", label: "Typography", icon: "📝" },
    { id: "content", label: "Content", icon: "✍️" },
    { id: "layout", label: "Layout", icon: "📐" },
    { id: "components", label: "Components", icon: "🧩" },
    { id: "advanced", label: "Advanced", icon: "⚙️" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", display: "flex", flexDirection: "column" }}>
      <AdminTopBar
        title="Portal Designer Studio"
        subtitle="AI-Powered Brand Discovery"
        icon={<span style={{ fontSize: 24 }}>🎨</span>}
        showBack={true}
        actions={
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {hasUnsavedChanges && <Badge variant="warning">● Unsaved</Badge>}
            {selectedCorporate && (
              <Button
                variant="ai"
                size="md"
                icon="💾"
                onClick={handleSave}
                loading={saving}
              >
                Save Design
              </Button>
            )}
            <div
              style={{
                height: "30px",
                width: "1px",
                backgroundColor: colors.gray[200],
              }}
            />
          </div>
        }
      />
      <main style={{ flex: 1, width: "100%", maxWidth: 1400, margin: "0 auto", padding: 24 }}>


      {/* Main Content Grid */}
      <div
        style={{
          padding: "24px",
          paddingRight: "0",
          display: "grid",
          gridTemplateColumns: selectedCorporate ? "1fr 420px" : "1fr",
          gap: "16px",
        }}
      >
        <div style={{ paddingRight: selectedCorporate ? "0" : "24px" }}>
          {/* Search Card */}
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "20px",
              padding: "24px",
              marginBottom: "24px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              border: `1px solid ${colors.gray[200]}`,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                marginBottom: "20px",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "14px",
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                }}
              >
                🏢
              </div>
              <div>
                <h2 style={{ fontSize: "18px", fontWeight: "700", margin: 0 }}>
                  Select Company
                </h2>
                <p
                  style={{
                    fontSize: "13px",
                    color: colors.gray[500],
                    margin: 0,
                  }}
                >
                  Search by name or subdomain
                </p>
              </div>
            </div>
            <div style={{ position: "relative" }}>
              <span
                style={{
                  position: "absolute",
                  left: "16px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: "18px",
                }}
              >
                🔍
              </span>
              <input
                type="text"
                placeholder="Type company name to search..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                style={{
                  width: "100%",
                  padding: "16px 16px 16px 48px",
                  border: `2px solid ${colors.gray[200]}`,
                  borderRadius: "14px",
                  fontSize: "15px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
            {searchQuery && (
              <div style={{ marginTop: "20px" }}>
                {loading ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "40px",
                      color: colors.gray[500],
                    }}
                  >
                    Loading...
                  </div>
                ) : filteredCorporates.length === 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "40px",
                      color: colors.gray[500],
                    }}
                  >
                    <div style={{ fontSize: "40px", marginBottom: "12px" }}>
                      🔍
                    </div>
                    No companies found
                  </div>
                ) : (
                  <>
                    <div
                      style={{
                        fontSize: "13px",
                        color: colors.gray[500],
                        marginBottom: "12px",
                      }}
                    >
                      Found {filteredCorporates.length} compan
                      {filteredCorporates.length === 1 ? "y" : "ies"}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                      }}
                    >
                      {paginatedCorporates.map((corp) => (
                        <div
                          key={corp.tenant_id}
                          onClick={() => handleCorporateSelect(corp)}
                          style={{
                            padding: "16px 20px",
                            border: `2px solid ${selectedCorporate?.tenant_id === corp.tenant_id ? colors.primary : colors.gray[200]}`,
                            borderRadius: "14px",
                            cursor: "pointer",
                            backgroundColor:
                              selectedCorporate?.tenant_id === corp.tenant_id
                                ? colors.primaryLight
                                : "white",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "14px",
                            }}
                          >
                            <div
                              style={{
                                width: "44px",
                                height: "44px",
                                borderRadius: "12px",
                                background: `linear-gradient(135deg, ${corp.primary_color || colors.primary}, ${corp.secondary_color || colors.secondary})`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "white",
                                fontWeight: "700",
                                fontSize: "16px",
                              }}
                            >
                              {corp.corporate_legal_name.charAt(0)}
                            </div>
                            <div>
                              <div
                                style={{ fontWeight: "600", fontSize: "15px" }}
                              >
                                {corp.corporate_legal_name}
                              </div>
                              <div
                                style={{
                                  fontSize: "12px",
                                  color: colors.gray[500],
                                }}
                              >
                                🌐 {corp.subdomain}.benefitnest.space
                              </div>
                            </div>
                          </div>
                          <Badge
                            variant={
                              corp.status === "ACTIVE" ? "success" : "warning"
                            }
                          >
                            {corp.status || "UNKNOWN"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                    {totalPages > 1 && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "12px",
                          marginTop: "20px",
                        }}
                      >
                        <button
                          onClick={() =>
                            setCurrentPage((p) => Math.max(1, p - 1))
                          }
                          disabled={currentPage === 1}
                          style={{
                            padding: "10px 16px",
                            border: `1px solid ${colors.gray[200]}`,
                            borderRadius: "10px",
                            backgroundColor: "white",
                            cursor:
                              currentPage === 1 ? "not-allowed" : "pointer",
                            opacity: currentPage === 1 ? 0.5 : 1,
                            fontSize: "13px",
                          }}
                        >
                          ← Previous
                        </button>
                        <span
                          style={{ fontSize: "13px", color: colors.gray[600] }}
                        >
                          Page {currentPage} of {totalPages}
                        </span>
                        <button
                          onClick={() =>
                            setCurrentPage((p) => Math.min(totalPages, p + 1))
                          }
                          disabled={currentPage === totalPages}
                          style={{
                            padding: "10px 16px",
                            border: `1px solid ${colors.gray[200]}`,
                            borderRadius: "10px",
                            backgroundColor: "white",
                            cursor:
                              currentPage === totalPages
                                ? "not-allowed"
                                : "pointer",
                            opacity: currentPage === totalPages ? 0.5 : 1,
                            fontSize: "13px",
                          }}
                        >
                          Next →
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
            {selectedCorporate && (
              <div
                style={{
                  marginTop: "20px",
                  padding: "20px",
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  borderRadius: "16px",
                  color: "white",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: "11px",
                        opacity: 0.8,
                        marginBottom: "4px",
                        textTransform: "uppercase",
                      }}
                    >
                      Now Editing
                    </div>
                    <div style={{ fontSize: "18px", fontWeight: "700" }}>
                      {selectedCorporate.corporate_legal_name}
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        opacity: 0.9,
                        marginTop: "4px",
                      }}
                    >
                      🌐 {selectedCorporate.subdomain}.benefitnest.space
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleVisitLive}
                    style={{
                      borderColor: "rgba(255,255,255,0.3)",
                      color: "white",
                    }}
                  >
                    🔗 Visit Live
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Design Controls */}
          {selectedCorporate && (
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "20px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                border: `1px solid ${colors.gray[200]}`,
                overflow: "hidden",
              }}
            >
              {/* AI Magic Bar */}
              <div
                style={{
                  padding: "20px 24px",
                  background:
                    "linear-gradient(135deg, #fef3c7, #fde68a, #fcd34d)",
                  borderBottom: `1px solid ${colors.warning}40`,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "16px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <div style={{ fontSize: "28px" }}>🤖</div>
                    <div>
                      <div
                        style={{
                          fontSize: "15px",
                          fontWeight: "700",
                          color: "#92400e",
                        }}
                      >
                        AI Brand Discovery
                      </div>
                      <div style={{ fontSize: "12px", color: "#a16207" }}>
                        Search the web for company branding & apply smart
                        defaults
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="magic"
                    size="lg"
                    icon="✨"
                    onClick={handleAIMagic}
                    loading={aiSearching}
                    disabled={aiSearching}
                  >
                    AI Magic
                  </Button>
                </div>
              </div>

              {/* Tabs */}
              <div
                style={{
                  display: "flex",
                  borderBottom: `1px solid ${colors.gray[200]}`,
                  overflowX: "auto",
                  backgroundColor: colors.gray[50],
                }}
              >
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      padding: "16px 22px",
                      border: "none",
                      borderBottom: `3px solid ${activeTab === tab.id ? colors.primary : "transparent"}`,
                      backgroundColor:
                        activeTab === tab.id ? "white" : "transparent",
                      cursor: "pointer",
                      fontSize: "13px",
                      fontWeight: "600",
                      color:
                        activeTab === tab.id
                          ? colors.primary
                          : colors.gray[500],
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <span style={{ fontSize: "16px" }}>{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div
                style={{
                  padding: "24px",
                  maxHeight: "600px",
                  overflowY: "auto",
                }}
              >
                {activeTab === "branding" && (
                  <div>
                    <ColorPicker
                      label="Primary Color"
                      value={customizations.primary_color}
                      onChange={(v: string) =>
                        updateCustomization("primary_color", v)
                      }
                    />
                    <ColorPicker
                      label="Secondary Color"
                      value={customizations.secondary_color}
                      onChange={(v: string) =>
                        updateCustomization("secondary_color", v)
                      }
                    />
                    <ColorPicker
                      label="Accent Color"
                      value={customizations.accent_color}
                      onChange={(v: string) =>
                        updateCustomization("accent_color", v)
                      }
                    />
                    <ColorPicker
                      label="Background Color"
                      value={customizations.background_color}
                      onChange={(v: string) =>
                        updateCustomization("background_color", v)
                      }
                    />
                    <ColorPicker
                      label="Text Color"
                      value={customizations.text_color}
                      onChange={(v: string) =>
                        updateCustomization("text_color", v)
                      }
                    />
                    <div
                      style={{
                        marginTop: "24px",
                        paddingTop: "24px",
                        borderTop: `1px solid ${colors.gray[200]}`,
                      }}
                    >
                      <h4
                        style={{
                          fontSize: "14px",
                          fontWeight: "600",
                          marginBottom: "16px",
                          color: colors.gray[700],
                        }}
                      >
                        🖼️ Logo
                      </h4>
                      <Input
                        label="Logo URL"
                        value={customizations.logo_url || ""}
                        onChange={(v: string) =>
                          updateCustomization("logo_url", v)
                        }
                        placeholder="https://example.com/logo.png"
                        icon="🔗"
                      />
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "12px",
                        }}
                      >
                        <Input
                          label="Width (px)"
                          type="number"
                          value={customizations.logo_width || 150}
                          onChange={(v: string) =>
                            updateCustomization("logo_width", parseInt(v))
                          }
                        />
                        <Input
                          label="Height (px)"
                          type="number"
                          value={customizations.logo_height || 60}
                          onChange={(v: string) =>
                            updateCustomization("logo_height", parseInt(v))
                          }
                        />
                      </div>
                    </div>
                  </div>
                )}
                {activeTab === "typography" && (
                  <div>
                    <FontSelector
                      label="Heading Font"
                      value={customizations.heading_font_family}
                      onChange={(v: string) =>
                        updateCustomization("heading_font_family", v)
                      }
                    />
                    <FontSelector
                      label="Body Font"
                      value={customizations.body_font_family}
                      onChange={(v: string) =>
                        updateCustomization("body_font_family", v)
                      }
                    />
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "12px",
                        marginTop: "16px",
                      }}
                    >
                      <Input
                        label="Heading Size (px)"
                        type="number"
                        value={customizations.heading_font_size || 32}
                        onChange={(v: string) =>
                          updateCustomization("heading_font_size", parseInt(v))
                        }
                      />
                      <Input
                        label="Body Size (px)"
                        type="number"
                        value={customizations.body_font_size || 16}
                        onChange={(v: string) =>
                          updateCustomization("body_font_size", parseInt(v))
                        }
                      />
                      <Input
                        label="Heading Weight"
                        type="number"
                        value={customizations.font_weight_heading || 700}
                        onChange={(v: string) =>
                          updateCustomization(
                            "font_weight_heading",
                            parseInt(v),
                          )
                        }
                        hint="400-900"
                      />
                      <Input
                        label="Line Height"
                        type="number"
                        value={customizations.line_height_multiplier || 1.6}
                        onChange={(v: string) =>
                          updateCustomization(
                            "line_height_multiplier",
                            parseFloat(v),
                          )
                        }
                        hint="1.0-2.0"
                      />
                    </div>
                  </div>
                )}
                {activeTab === "content" && (
                  <div>
                    <Input
                      label="Portal Title"
                      value={customizations.portal_title || ""}
                      onChange={(v: string) =>
                        updateCustomization("portal_title", v)
                      }
                      placeholder="Your Company Benefits"
                      icon="📛"
                    />
                    <Input
                      label="Portal Tagline"
                      value={customizations.portal_tagline || ""}
                      onChange={(v: string) =>
                        updateCustomization("portal_tagline", v)
                      }
                      placeholder="Your Employee Benefits Hub"
                      icon="💬"
                    />
                    <div style={{ marginBottom: "16px" }}>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "6px",
                          fontSize: "13px",
                          fontWeight: "600",
                          color: colors.gray[700],
                        }}
                      >
                        Portal Description
                      </label>
                      <textarea
                        value={customizations.portal_description || ""}
                        onChange={(e) =>
                          updateCustomization(
                            "portal_description",
                            e.target.value,
                          )
                        }
                        placeholder="A brief description..."
                        style={{
                          width: "100%",
                          padding: "12px 14px",
                          border: `2px solid ${colors.gray[200]}`,
                          borderRadius: "10px",
                          fontSize: "14px",
                          minHeight: "80px",
                          resize: "vertical",
                          outline: "none",
                          boxSizing: "border-box",
                          fontFamily: "inherit",
                        }}
                      />
                    </div>
                    <div
                      style={{
                        marginTop: "24px",
                        padding: "20px",
                        backgroundColor: colors.gray[50],
                        borderRadius: "14px",
                        border: `1px solid ${colors.gray[200]}`,
                      }}
                    >
                      <div
                        style={{
                          fontSize: "14px",
                          fontWeight: "700",
                          color: colors.gray[700],
                          marginBottom: "16px",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <span>🦸</span> Hero Section
                      </div>
                      <Input
                        label="Headline"
                        value={customizations.hero_headline || ""}
                        onChange={(v: string) =>
                          updateCustomization("hero_headline", v)
                        }
                        placeholder="Welcome to Your Benefits"
                      />
                      <Input
                        label="Subheadline"
                        value={customizations.hero_subheadline || ""}
                        onChange={(v: string) =>
                          updateCustomization("hero_subheadline", v)
                        }
                        placeholder="Everything in one place"
                      />
                      <Input
                        label="Background Image URL"
                        value={customizations.hero_background_image_url || ""}
                        onChange={(v: string) =>
                          updateCustomization("hero_background_image_url", v)
                        }
                        placeholder="https://example.com/hero.jpg"
                        icon="🖼️"
                      />
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "12px",
                        }}
                      >
                        <Input
                          label="CTA Button Text"
                          value={customizations.hero_cta_button_text || ""}
                          onChange={(v: string) =>
                            updateCustomization("hero_cta_button_text", v)
                          }
                          placeholder="Get Started"
                        />
                        <Input
                          label="CTA Button URL"
                          value={customizations.hero_cta_button_url || ""}
                          onChange={(v: string) =>
                            updateCustomization("hero_cta_button_url", v)
                          }
                          placeholder="#benefits"
                        />
                      </div>
                    </div>
                  </div>
                )}
                {activeTab === "layout" && (
                  <div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "12px",
                      }}
                    >
                      <Input
                        label="Container Max Width (px)"
                        type="number"
                        value={customizations.container_max_width || 1200}
                        onChange={(v: string) =>
                          updateCustomization(
                            "container_max_width",
                            parseInt(v),
                          )
                        }
                      />
                      <Input
                        label="Section Gap (px)"
                        type="number"
                        value={customizations.section_gap || 40}
                        onChange={(v: string) =>
                          updateCustomization("section_gap", parseInt(v))
                        }
                      />
                      <Input
                        label="Horizontal Padding (px)"
                        type="number"
                        value={customizations.container_padding_x || 20}
                        onChange={(v: string) =>
                          updateCustomization(
                            "container_padding_x",
                            parseInt(v),
                          )
                        }
                      />
                      <Input
                        label="Vertical Padding (px)"
                        type="number"
                        value={customizations.container_padding_y || 20}
                        onChange={(v: string) =>
                          updateCustomization(
                            "container_padding_y",
                            parseInt(v),
                          )
                        }
                      />
                    </div>
                  </div>
                )}
                {activeTab === "components" && (
                  <div>
                    <p
                      style={{
                        fontSize: "13px",
                        color: colors.gray[500],
                        marginBottom: "20px",
                      }}
                    >
                      Toggle which sections appear on the employee portal
                    </p>
                    <h4
                      style={{
                        fontSize: "14px",
                        fontWeight: "600",
                        marginBottom: "16px",
                        color: colors.gray[700],
                      }}
                    >
                      🔐 Login Page Settings
                    </h4>
                    <Toggle
                      label="Consent Checkbox"
                      value={customizations.show_consent_checkbox !== false}
                      onChange={(v: boolean) =>
                        updateCustomization("show_consent_checkbox", v)
                      }
                      description="Require users to accept terms before login"
                    />
                    <Toggle
                      label="Privacy Policy Link"
                      value={customizations.show_privacy_link !== false}
                      onChange={(v: boolean) =>
                        updateCustomization("show_privacy_link", v)
                      }
                      description="Show privacy policy link on login"
                    />
                    <Toggle
                      label="Terms & Conditions Link"
                      value={customizations.show_terms_link !== false}
                      onChange={(v: boolean) =>
                        updateCustomization("show_terms_link", v)
                      }
                      description="Show terms link on login"
                    />
                    <Toggle
                      label="Disclaimer Link"
                      value={customizations.show_disclaimer_link !== false}
                      onChange={(v: boolean) =>
                        updateCustomization("show_disclaimer_link", v)
                      }
                      description="Show disclaimer link on login"
                    />
                    <Toggle
                      label="Remember Me Option"
                      value={customizations.show_remember_me !== false}
                      onChange={(v: boolean) =>
                        updateCustomization("show_remember_me", v)
                      }
                      description="Allow users to stay logged in"
                    />
                    <Toggle
                      label="Forgot Password Link"
                      value={customizations.show_forgot_password !== false}
                      onChange={(v: boolean) =>
                        updateCustomization("show_forgot_password", v)
                      }
                      description="Show forgot password option"
                    />
                    <Toggle
                      label="Login Method Selector"
                      value={
                        customizations.show_login_method_selector !== false
                      }
                      onChange={(v: boolean) =>
                        updateCustomization("show_login_method_selector", v)
                      }
                      description="Allow email, mobile, employee ID login"
                    />
                    <Toggle
                      label="OTP Login"
                      value={customizations.enable_otp_login !== false}
                      onChange={(v: boolean) =>
                        updateCustomization("enable_otp_login", v)
                      }
                      description="Enable one-time password login"
                    />
                    <h4
                      style={{
                        fontSize: "14px",
                        fontWeight: "600",
                        marginTop: "24px",
                        marginBottom: "16px",
                        color: colors.gray[700],
                      }}
                    >
                      📱 Dashboard Sections
                    </h4>
                    <Toggle
                      label="Header"
                      value={customizations.show_header !== false}
                      onChange={(v: boolean) =>
                        updateCustomization("show_header", v)
                      }
                      description="Navigation bar with logo and menu"
                    />
                    <Toggle
                      label="Hero Section"
                      value={customizations.show_hero_section !== false}
                      onChange={(v: boolean) =>
                        updateCustomization("show_hero_section", v)
                      }
                      description="Welcome banner with headline and CTA"
                    />
                    <Toggle
                      label="Benefits Overview"
                      value={customizations.show_benefits_section !== false}
                      onChange={(v: boolean) =>
                        updateCustomization("show_benefits_section", v)
                      }
                      description="Summary of available benefits"
                    />
                    <Toggle
                      label="Features Grid"
                      value={customizations.show_features_section !== false}
                      onChange={(v: boolean) =>
                        updateCustomization("show_features_section", v)
                      }
                      description="Feature cards with icons"
                    />
                    <Toggle
                      label="FAQ Section"
                      value={customizations.show_faq_section !== false}
                      onChange={(v: boolean) =>
                        updateCustomization("show_faq_section", v)
                      }
                      description="Frequently asked questions"
                    />
                    <Toggle
                      label="Contact Information"
                      value={customizations.show_contact_section !== false}
                      onChange={(v: boolean) =>
                        updateCustomization("show_contact_section", v)
                      }
                      description="HR contact details"
                    />
                    <Toggle
                      label="Footer"
                      value={customizations.show_footer !== false}
                      onChange={(v: boolean) =>
                        updateCustomization("show_footer", v)
                      }
                      description="Copyright and links"
                    />
                  </div>
                )}
                {activeTab === "advanced" && (
                  <div>
                    <h4
                      style={{
                        fontSize: "14px",
                        fontWeight: "600",
                        marginBottom: "16px",
                        color: colors.gray[700],
                      }}
                    >
                      🌍 Regional Settings
                    </h4>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "12px",
                      }}
                    >
                      <Input
                        label="Currency"
                        value={customizations.default_currency || "USD"}
                        onChange={(v: string) =>
                          updateCustomization("default_currency", v)
                        }
                        placeholder="USD, EUR, INR"
                      />
                      <Input
                        label="Timezone"
                        value={customizations.timezone || "UTC"}
                        onChange={(v: string) =>
                          updateCustomization("timezone", v)
                        }
                        placeholder="UTC, IST, EST"
                      />
                      <Input
                        label="Date Format"
                        value={customizations.date_format || "MM/DD/YYYY"}
                        onChange={(v: string) =>
                          updateCustomization("date_format", v)
                        }
                      />
                      <Input
                        label="Language"
                        value={customizations.default_language || "en"}
                        onChange={(v: string) =>
                          updateCustomization("default_language", v)
                        }
                        placeholder="en, es, fr"
                      />
                    </div>
                    <h4
                      style={{
                        fontSize: "14px",
                        fontWeight: "600",
                        marginTop: "24px",
                        marginBottom: "16px",
                        color: colors.gray[700],
                      }}
                    >
                      🔒 Security
                    </h4>
                    <Toggle
                      label="Dark Mode Support"
                      value={customizations.dark_mode_enabled}
                      onChange={(v: boolean) =>
                        updateCustomization("dark_mode_enabled", v)
                      }
                      description="Allow users to switch to dark theme"
                    />
                    <Toggle
                      label="SSO Authentication"
                      value={customizations.sso_enabled}
                      onChange={(v: boolean) =>
                        updateCustomization("sso_enabled", v)
                      }
                      description="Single sign-on integration"
                    />
                    <Toggle
                      label="GDPR Compliance"
                      value={customizations.gdpr_enabled}
                      onChange={(v: boolean) =>
                        updateCustomization("gdpr_enabled", v)
                      }
                      description="EU data protection features"
                    />
                    <Toggle
                      label="Cookie Consent Banner"
                      value={customizations.show_cookie_consent}
                      onChange={(v: boolean) =>
                        updateCustomization("show_cookie_consent", v)
                      }
                      description="Display cookie notice"
                    />
                    <h4
                      style={{
                        fontSize: "14px",
                        fontWeight: "600",
                        marginTop: "24px",
                        marginBottom: "16px",
                        color: colors.gray[700],
                      }}
                    >
                      💻 Custom CSS
                    </h4>
                    <textarea
                      value={customizations.custom_css || ""}
                      onChange={(e) =>
                        updateCustomization("custom_css", e.target.value)
                      }
                      placeholder="/* Add custom CSS */"
                      style={{
                        width: "100%",
                        padding: "16px",
                        border: `2px solid ${colors.gray[700]}`,
                        borderRadius: "10px",
                        fontSize: "13px",
                        minHeight: "150px",
                        fontFamily: "Monaco, Consolas, monospace",
                        backgroundColor: colors.gray[900],
                        color: "#10b981",
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!selectedCorporate && !searchQuery && (
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "20px",
                padding: "80px 40px",
                textAlign: "center",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                border: `1px solid ${colors.gray[200]}`,
              }}
            >
              <div style={{ fontSize: "72px", marginBottom: "20px" }}>🎨</div>
              <h2
                style={{
                  fontSize: "28px",
                  fontWeight: "800",
                  color: colors.gray[900],
                  marginBottom: "12px",
                }}
              >
                Portal Designer Studio
              </h2>
              <p
                style={{
                  fontSize: "16px",
                  color: colors.gray[500],
                  maxWidth: "500px",
                  margin: "0 auto 32px",
                  lineHeight: 1.6,
                }}
              >
                Create stunning, branded employee benefit portals with
                AI-powered design suggestions and real-time preview.
              </p>
              <div
                style={{
                  display: "flex",
                  gap: "16px",
                  justifyContent: "center",
                  flexWrap: "wrap",
                }}
              >
                <Badge variant="primary">🤖 AI Brand Discovery</Badge>
                <Badge variant="success">⚡ Real-time Preview</Badge>
                <Badge variant="warning">🎨 Smart Palettes</Badge>
              </div>
            </div>
          )}
        </div>

        {/* Live Preview Panel */}
        {selectedCorporate && (
          <div
            style={{
              position: "sticky",
              top: "90px",
              height: "calc(100vh - 130px)",
            }}
          >
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "20px 0 0 20px",
                padding: "16px",
                paddingRight: "20px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                borderLeft: `1px solid ${colors.gray[200]}`,
                borderTop: `1px solid ${colors.gray[200]}`,
                borderBottom: `1px solid ${colors.gray[200]}`,
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Title Row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "12px",
                }}
              >
                <span style={{ fontSize: "20px" }}>👁️</span>
                <div>
                  <span
                    style={{
                      fontSize: "15px",
                      fontWeight: "700",
                      color: colors.gray[900],
                    }}
                  >
                    Live Preview
                  </span>
                  <div style={{ fontSize: "11px", color: colors.gray[500] }}>
                    Changes appear instantly
                  </div>
                </div>
              </div>
              {/* Preview Type Toggle Row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "8px",
                }}
              >
                <span
                  style={{
                    fontSize: "12px",
                    color: colors.gray[600],
                    fontWeight: 600,
                  }}
                >
                  Preview:
                </span>
                <Button
                  size="xs"
                  variant={previewType === "main" ? "primary" : "outline"}
                  onClick={() => setPreviewType("main")}
                >
                  Dashboard
                </Button>
                <Button
                  size="xs"
                  variant={previewType === "login" ? "primary" : "outline"}
                  onClick={() => setPreviewType("login")}
                >
                  Login Page
                </Button>
              </div>
              {/* Expand Button Row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "12px",
                  paddingBottom: "12px",
                  borderBottom: `1px solid ${colors.gray[200]}`,
                }}
              >
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => setShowPreviewModal(true)}
                >
                  ↗ Expand
                </Button>
              </div>
              <div
                style={{
                  flex: 1,
                  borderRadius: "12px 0 0 12px",
                  overflow: "hidden",
                  border: `1px solid ${colors.gray[200]}`,
                  borderRight: "none",
                  backgroundColor: colors.gray[100],
                }}
              >
                <div
                  style={{
                    backgroundColor: colors.gray[200],
                    padding: "8px 12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <div style={{ display: "flex", gap: "6px" }}>
                    <div
                      style={{
                        width: "10px",
                        height: "10px",
                        borderRadius: "50%",
                        backgroundColor: "#ef4444",
                      }}
                    />
                    <div
                      style={{
                        width: "10px",
                        height: "10px",
                        borderRadius: "50%",
                        backgroundColor: "#f59e0b",
                      }}
                    />
                    <div
                      style={{
                        width: "10px",
                        height: "10px",
                        borderRadius: "50%",
                        backgroundColor: "#10b981",
                      }}
                    />
                  </div>
                  <div
                    style={{
                      flex: 1,
                      backgroundColor: "white",
                      borderRadius: "4px",
                      padding: "4px 10px",
                      marginLeft: "8px",
                    }}
                  >
                    <span style={{ fontSize: "10px", color: colors.gray[500] }}>
                      🔒 {selectedCorporate.subdomain}.benefitnest.space
                    </span>
                  </div>
                </div>
                <div
                  style={{ height: "calc(100% - 34px)", overflow: "hidden" }}
                >
                  <LivePreview
                    customizations={customizations}
                    corporate={selectedCorporate}
                    previewMode={previewMode}
                    forceLoginPage={previewType === "login"}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      </main>
      <AdminFooter />
      {/* Styles */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } } * { box-sizing: border-box; } input:focus, select:focus, textarea:focus { border-color: ${colors.primary} !important; } ::-webkit-scrollbar { width: 8px; height: 8px; } ::-webkit-scrollbar-track { background: ${colors.gray[100]}; border-radius: 4px; } ::-webkit-scrollbar-thumb { background: ${colors.gray[300]}; border-radius: 4px; }`}</style>
    </div>
  );
}
