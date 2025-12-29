"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams } from "next/navigation";
import ReCAPTCHA from "react-google-recaptcha";
import MarketplacePage from "../components/marketplace/MarketplacePage";

const API_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "https://benefitnest-backend.onrender.com";

interface PortalConfig {
  tenant_id: string;
  company_name: string;
  subdomain: string;
  logo_url?: string;
  primary_color: string;
  secondary_color: string;
  contact_email?: string;
  contact_phone?: string;
  status: string;
  accent_color?: string;
  background_color?: string;
  text_color?: string;
  border_color?: string;
  heading_font_family?: string;
  body_font_family?: string;
  heading_font_size?: number;
  body_font_size?: number;
  font_weight_heading?: number;
  line_height_multiplier?: number;
  portal_title?: string;
  portal_tagline?: string;
  hero_headline?: string;
  hero_subheadline?: string;
  hero_cta_button_text?: string;
  hero_cta_button_url?: string;
  show_header?: boolean;
  show_hero_section?: boolean;
  show_features_section?: boolean;
  show_contact_section?: boolean;
  show_footer?: boolean;
  custom_css?: string;
  logo_width?: number;
  logo_height?: number;
}

interface Customizations {
  [key: string]: any;
}

interface CompliancePolicies {
  privacy_policy_title: string;
  privacy_policy_content: string;
  terms_conditions_title: string;
  terms_conditions_content: string;
  disclaimer_title: string;
  disclaimer_content: string;
  consent_checkbox_text: string;
  consent_details_content: string;
  dpa_required?: boolean;
  dpa_title?: string;
  dpa_content?: string;
}

export default function PortalPage() {
  const params = useParams();
  const subdomain = params?.subdomain as string;
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const [portalConfig, setPortalConfig] = useState<PortalConfig | null>(null);
  const [customizations, setCustomizations] = useState<Customizations | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // New states for enhanced login
  const [loginMethod, setLoginMethod] = useState<
    "email" | "mobile" | "userid" | "employeeid"
  >("email");
  const [consentChecked, setConsentChecked] = useState(false);
  const [showConsentDetails, setShowConsentDetails] = useState(false);
  const [showOtpLogin, setShowOtpLogin] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showDisclaimerModal, setShowDisclaimerModal] = useState(false);
  const [showDpaModal, setShowDpaModal] = useState(false);
  const [compliancePolicies, setCompliancePolicies] =
    useState<CompliancePolicies | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("portal_token");
    const savedTenant = localStorage.getItem("portal_tenant");
    if (token && savedTenant) {
      try {
        const tenant = JSON.parse(savedTenant);
        if (tenant.subdomain === subdomain) setIsLoggedIn(true);
      } catch {}
    }
  }, [subdomain]);

  useEffect(() => {
    const fetchPortalConfig = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${API_URL}/api/portal/config/${subdomain}`,
        );
        if (!response.ok) throw new Error(`Portal not found: ${subdomain}`);
        const result = await response.json();
        console.log("[Portal] API Response:", result);
        if (result.success && result.data) {
          setPortalConfig(result.data);
          // Check both nested customizations and root-level properties
          const customData = result.data.customizations || result.data;
          console.log("[Portal] Customizations:", customData);
          console.log(
            "[Portal] Primary color from API:",
            customData?.primary_color,
          );
          setCustomizations(customData);

          // Fetch compliance policies
          try {
            const policiesResponse = await fetch(
              `${API_URL}/api/portal/compliance-policies/${subdomain}`,
            );
            if (policiesResponse.ok) {
              const policiesResult = await policiesResponse.json();
              if (policiesResult.success && policiesResult.data) {
                setCompliancePolicies(policiesResult.data);
                console.log("[Portal] Compliance policies loaded");
              }
            }
          } catch (policyErr) {
            console.warn(
              "[Portal] Could not load compliance policies:",
              policyErr,
            );
          }
        } else throw new Error("Invalid portal data");
      } catch (err: any) {
        console.error("[Portal] Error:", err);
        setError(err.message || "Failed to load portal");
      } finally {
        setLoading(false);
      }
    };
    if (subdomain) fetchPortalConfig();
  }, [subdomain]);

  const theme = useMemo(() => {
    // Priority: customizations > portalConfig > defaults
    const c: Customizations = customizations || {};
    const p: Partial<PortalConfig> = portalConfig || {};
    console.log("[Portal] Building theme - customizations:", c);
    console.log("[Portal] Building theme - portalConfig:", p);

    const builtTheme = {
      primary: c.primary_color || p.primary_color || "#db2777",
      secondary: c.secondary_color || p.secondary_color || "#9333ea",
      accent: c.accent_color || "#f59e0b",
      background: c.background_color || "#ffffff",
      text: c.text_color || "#111827",
      border: c.border_color || "#e5e7eb",
      headingFont: c.heading_font_family || "Segoe UI",
      bodyFont: c.body_font_family || "Segoe UI",
      headingSize: c.heading_font_size || 42,
      bodySize: c.body_font_size || 16,
      headingWeight: c.font_weight_heading || 700,
      lineHeight: c.line_height_multiplier || 1.6,
      logoUrl: c.logo_url || p.logo_url,
      logoWidth: c.logo_width || 150,
      logoHeight: c.logo_height || 50,
      portalTitle: c.portal_title || p.company_name || "Employee Portal",
      tagline:
        c.portal_tagline ||
        "To keep connected with us please login with your personal info",
      customCss: c.custom_css || "",
    };
    console.log("[Portal] Built theme:", builtTheme);
    return builtTheme;
  }, [customizations, portalConfig]);

  // Login page visibility settings from customizations
  const loginSettings = useMemo(() => {
    const c: Customizations = customizations || {};
    const settings = {
      showConsent: c.show_consent_checkbox !== false,
      showPrivacy: c.show_privacy_link !== false,
      showTerms: c.show_terms_link !== false,
      showDisclaimer: c.show_disclaimer_link !== false,
      showRememberMe: c.show_remember_me !== false,
      showForgotPassword: c.show_forgot_password !== false,
      showLoginMethodSelector: c.show_login_method_selector !== false,
      enableOtpLogin: c.enable_otp_login !== false,
    };
    console.log("[Portal] Login Settings:", settings);
    console.log("[Portal] Raw customizations for login:", {
      show_consent_checkbox: c.show_consent_checkbox,
      show_privacy_link: c.show_privacy_link,
      show_remember_me: c.show_remember_me,
      enable_otp_login: c.enable_otp_login,
    });
    return settings;
  }, [customizations]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    if (!employeeId || !password) {
      setLoginError("Please enter your credentials");
      return;
    }
    // Only require consent if consent checkbox is enabled
    if (loginSettings.showConsent && !consentChecked) {
      setLoginError("Please accept the terms and conditions to continue");
      return;
    }
    setLoggingIn(true);
    try {
      const response = await fetch(`${API_URL}/api/portal/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenant_id: portalConfig?.tenant_id,
          subdomain: portalConfig?.subdomain,
          employee_id: employeeId,
          password,
          rememberMe,
          captchaToken,
          login_method: loginMethod,
        }),
      });
      const data = await response.json();
      if (data.success) {
        localStorage.setItem("portal_token", data.token);
        localStorage.setItem("portal_user", JSON.stringify(data.user));
        localStorage.setItem("portal_tenant", JSON.stringify(portalConfig));
        if (rememberMe)
          document.cookie = `portal_token=${data.token}; path=/; max-age=2592000`;
        setIsLoggedIn(true);
      } else {
        setLoginError(data.message || "Invalid credentials");
        recaptchaRef.current?.reset();
        setCaptchaToken(null);
      }
    } catch {
      setLoginError("Login failed. Please try again.");
      recaptchaRef.current?.reset();
      setCaptchaToken(null);
    } finally {
      setLoggingIn(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/portal/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenant_id: portalConfig?.tenant_id,
          email: forgotEmail,
        }),
      });
      const data = await response.json();
      if (data.success) setForgotSuccess(true);
      else setLoginError(data.message || "Failed to send reset email");
    } catch {
      setLoginError("Failed to send reset email");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("portal_token");
    localStorage.removeItem("portal_user");
    localStorage.removeItem("portal_tenant");
    document.cookie = "portal_token=; path=/; max-age=0";
    setIsLoggedIn(false);
  };

  const handleSendOtp = async () => {
    if (!employeeId) {
      setLoginError("Please enter your login ID first");
      return;
    }
    setSendingOtp(true);
    setLoginError("");
    try {
      const response = await fetch(`${API_URL}/api/portal/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenant_id: portalConfig?.tenant_id,
          login_id: employeeId,
          login_method: loginMethod,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setOtpSent(true);
      } else {
        setLoginError(data.message || "Failed to send OTP");
      }
    } catch {
      setLoginError("Failed to send OTP. Please try again.");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleOtpLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId || !otp) {
      setLoginError("Please enter your ID and OTP");
      return;
    }
    if (!consentChecked) {
      setLoginError("Please accept the terms and conditions to continue");
      return;
    }
    setLoggingIn(true);
    setLoginError("");
    try {
      const response = await fetch(`${API_URL}/api/portal/verify-otp-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenant_id: portalConfig?.tenant_id,
          subdomain: portalConfig?.subdomain,
          login_id: employeeId,
          login_method: loginMethod,
          otp,
        }),
      });
      const data = await response.json();
      if (data.success) {
        localStorage.setItem("portal_token", data.token);
        localStorage.setItem("portal_user", JSON.stringify(data.user));
        localStorage.setItem("portal_tenant", JSON.stringify(portalConfig));
        setIsLoggedIn(true);
      } else {
        setLoginError(data.message || "Invalid OTP");
      }
    } catch {
      setLoginError("Login failed. Please try again.");
    } finally {
      setLoggingIn(false);
    }
  };

  const getLoginMethodLabel = () => {
    switch (loginMethod) {
      case "email":
        return "Registered Email";
      case "mobile":
        return "Mobile Number";
      case "userid":
        return "User ID";
      case "employeeid":
        return "Employee ID";
      default:
        return "Employee ID";
    }
  };

  const getLoginMethodPlaceholder = () => {
    switch (loginMethod) {
      case "email":
        return "Enter your registered email";
      case "mobile":
        return "Enter your mobile number";
      case "userid":
        return "Enter your user ID";
      case "employeeid":
        return "Enter your employee ID";
      default:
        return "Enter your employee ID";
    }
  };

  // Loading State
  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`,
        }}
      >
        <div
          style={{
            backgroundColor: "white",
            padding: "40px 60px",
            borderRadius: "20px",
            textAlign: "center",
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
          }}
        >
          <div
            style={{
              width: "50px",
              height: "50px",
              border: "4px solid #e5e7eb",
              borderTopColor: theme.primary,
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 20px",
            }}
          />
          <p style={{ color: "#374151", margin: 0, fontSize: "16px" }}>
            Loading portal...
          </p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Error State
  if (error || !portalConfig) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`,
        }}
      >
        <div
          style={{
            backgroundColor: "white",
            padding: "50px",
            borderRadius: "20px",
            textAlign: "center",
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
            maxWidth: "420px",
          }}
        >
          <div style={{ fontSize: "64px", marginBottom: "20px" }}>🏢</div>
          <h1
            style={{
              fontSize: "26px",
              fontWeight: 700,
              color: "#111827",
              marginBottom: "12px",
            }}
          >
            Portal Not Found
          </h1>
          <p
            style={{ color: "#6b7280", marginBottom: "28px", lineHeight: 1.6 }}
          >
            {error}
          </p>
          <a
            href="https://benefitnest.space"
            style={{
              display: "inline-block",
              padding: "14px 32px",
              backgroundColor: theme.primary,
              color: "white",
              borderRadius: "50px",
              textDecoration: "none",
              fontWeight: 600,
              fontSize: "15px",
            }}
          >
            Go to Main Site
          </a>
        </div>
      </div>
    );
  }

  // Dashboard (after login)
  if (isLoggedIn)
    return (
      <PortalDashboard
        config={portalConfig}
        customizations={customizations}
        theme={theme}
        onLogout={handleLogout}
      />
    );

  // ==========================================
  // LOGIN PAGE - Sliding Panel Design (Like GIF)
  // ==========================================
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: theme.bodyFont,
        overflow: "hidden",
        background: `linear-gradient(135deg, ${theme.primary}15 0%, ${theme.secondary}15 100%)`,
      }}
    >
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes blob { 
          0%, 100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; } 
          50% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; } 
        }
        @keyframes float { 
          0%, 100% { transform: translateY(0) rotate(0deg); } 
          50% { transform: translateY(-15px) rotate(3deg); } 
        }
        @keyframes confetti {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.6; }
          50% { transform: translateY(-10px) rotate(180deg); opacity: 1; }
        }
        .blob-shape { animation: blob 8s ease-in-out infinite; }
        .float-animation { animation: float 4s ease-in-out infinite; }
        .confetti { animation: confetti 3s ease-in-out infinite; }
        .slide-container { transition: transform 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55); }
        .panel-slide { transition: all 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55); }
        input:focus { outline: none; border-color: ${theme.primary} !important; box-shadow: 0 0 0 4px ${theme.primary}20; }
        .signin-btn:hover { transform: translateY(-3px); box-shadow: 0 20px 40px -15px ${theme.primary}60 !important; }
        .outline-btn:hover { background-color: rgba(255,255,255,0.15) !important; transform: scale(1.02); }
        
        /* Responsive Styles */
        .login-main-container {
          width: 100%;
          max-width: 1000px;
          min-height: 600px;
          display: flex;
          flex-direction: row;
          border-radius: 30px;
          overflow: hidden;
          box-shadow: 0 50px 100px -30px rgba(0,0,0,0.3);
          position: relative;
          margin: 20px;
        }
        .left-panel {
          width: 50%;
          min-width: 300px;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 50px 40px;
          overflow: hidden;
          z-index: 10;
        }
        .left-panel.forgot { width: 40%; }
        .right-panel {
          flex: 1;
          display: flex;
          flex-direction: column;
          background-color: #f8f4ff;
          position: relative;
          overflow: hidden;
        }
        .form-area {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 50px 60px;
          position: relative;
          z-index: 10;
        }
        .form-container {
          width: 100%;
          max-width: 380px;
        }
        .welcome-title {
          font-size: 42px;
          line-height: 1.1;
        }
        .welcome-text {
          font-size: 16px;
        }
        .form-title {
          font-size: 28px;
        }
        .blob-edge {
          position: absolute;
          right: -1px;
          top: 0;
          height: 100%;
          width: 100px;
          z-index: 5;
        }
        .decorative-elements { display: block; }
        
        /* Tablet */
        @media (max-width: 900px) {
          .login-main-container {
            max-width: 95%;
            min-height: auto;
            margin: 15px;
            border-radius: 24px;
          }
          .left-panel {
            width: 45%;
            padding: 40px 30px;
          }
          .left-panel.forgot { width: 35%; }
          .form-area {
            padding: 40px 35px;
          }
          .welcome-title {
            font-size: 32px;
          }
          .welcome-text {
            font-size: 14px;
          }
          .blob-edge { width: 60px; }
        }
        
        /* Mobile Landscape & Small Tablets */
        @media (max-width: 768px) {
          .login-main-container {
            flex-direction: column;
            max-width: 100%;
            margin: 0;
            border-radius: 0;
            min-height: 100vh;
            box-shadow: none;
          }
          .left-panel {
            width: 100% !important;
            min-height: 200px;
            padding: 30px 25px;
            border-radius: 0 0 30px 30px;
          }
          .blob-edge { display: none; }
          .right-panel {
            border-radius: 0;
          }
          .form-area {
            padding: 30px 25px;
          }
          .welcome-title {
            font-size: 28px;
            margin-bottom: 10px !important;
          }
          .welcome-text {
            font-size: 14px;
            margin-bottom: 20px !important;
          }
          .form-title {
            font-size: 24px;
          }
          .decorative-elements { display: none; }
        }
        
        /* Mobile Portrait */
        @media (max-width: 480px) {
          .login-main-container {
            min-height: 100dvh;
          }
          .left-panel {
            min-height: 180px;
            padding: 25px 20px;
          }
          .form-area {
            padding: 25px 20px;
          }
          .form-container {
            max-width: 100%;
          }
          .welcome-title {
            font-size: 24px;
          }
          .welcome-text {
            font-size: 13px;
          }
          .form-title {
            font-size: 22px;
          }
        }
        
        /* Very Small Phones */
        @media (max-width: 360px) {
          .left-panel {
            min-height: 150px;
            padding: 20px 15px;
          }
          .form-area {
            padding: 20px 15px;
          }
          .welcome-title {
            font-size: 22px;
          }
          .form-title {
            font-size: 20px;
          }
        }
        
        /* Modal Responsive */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background-color: rgba(0,0,0,0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 20px;
        }
        .modal-content {
          background-color: white;
          border-radius: 20px;
          max-width: 700px;
          width: 100%;
          max-height: 80vh;
          overflow: hidden;
          box-shadow: 0 25px 50px rgba(0,0,0,0.25);
        }
        .modal-header {
          padding: 24px 28px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .modal-body {
          padding: 28px;
          overflow-y: auto;
          max-height: calc(80vh - 80px);
          font-size: 14px;
          line-height: 1.8;
        }
        
        @media (max-width: 768px) {
          .modal-overlay {
            padding: 10px;
            align-items: flex-end;
          }
          .modal-content {
            border-radius: 20px 20px 0 0;
            max-height: 90vh;
          }
          .modal-header {
            padding: 20px;
          }
          .modal-body {
            padding: 20px;
            max-height: calc(90vh - 70px);
          }
        }
        
        @media (max-width: 480px) {
          .modal-header h3 {
            font-size: 18px !important;
          }
          .modal-body {
            font-size: 13px;
          }
        }
        
        ${theme.customCss}
      `}</style>

      {/* Main Container */}
      <div className="login-main-container">
        {/* ========== LEFT PANEL - Pink Blob with Welcome ========== */}
        <div
          className={`panel-slide left-panel ${showForgotPassword ? "forgot" : ""}`}
          style={{
            background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`,
          }}
        >
          {/* Organic Blob Edge - Like in the GIF */}
          <svg
            className="blob-edge"
            viewBox="0 0 100 600"
            preserveAspectRatio="none"
          >
            <path
              d="M0,0 L0,600 L100,600 C60,550 30,480 50,400 C70,320 30,260 60,180 C90,100 50,50 80,0 Z"
              fill={`url(#gradient-${theme.primary.replace("#", "")})`}
            />
            <defs>
              <linearGradient
                id={`gradient-${theme.primary.replace("#", "")}`}
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop offset="0%" stopColor={theme.primary} />
                <stop offset="100%" stopColor={theme.secondary} />
              </linearGradient>
            </defs>
          </svg>

          {/* Decorative Elements - Like in the GIF */}
          <div className="decorative-elements">
            <div
              className="blob-shape"
              style={{
                position: "absolute",
                top: "-80px",
                left: "-80px",
                width: "250px",
                height: "250px",
                background: "rgba(255,255,255,0.08)",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: "8%",
                left: "5%",
                width: "120px",
                height: "120px",
                border: "3px solid rgba(255,255,255,0.15)",
                borderRadius: "50%",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: "20%",
                left: "10%",
                width: "50px",
                height: "50px",
                border: "2px solid rgba(255,255,255,0.12)",
                borderRadius: "8px",
                transform: "rotate(45deg)",
              }}
            />
            <div
              className="blob-shape"
              style={{
                position: "absolute",
                bottom: "15%",
                left: "20%",
                width: "80px",
                height: "80px",
                background: "rgba(0,0,0,0.1)",
                animationDelay: "-3s",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: "60%",
                left: "8%",
                width: "30px",
                height: "30px",
                background: "rgba(255,255,255,0.1)",
                borderRadius: "50%",
              }}
            />
          </div>

          {/* Main Content */}
          <div
            style={{
              position: "relative",
              zIndex: 10,
              textAlign: "center",
              color: "white",
              maxWidth: "320px",
              padding: "0 10px",
            }}
          >
            {/* Logo */}
            {theme.logoUrl ? (
              <img
                src={theme.logoUrl}
                alt={theme.portalTitle}
                style={{
                  maxWidth: `${Math.min(theme.logoWidth, 120)}px`,
                  maxHeight: `${Math.min(theme.logoHeight, 60)}px`,
                  marginBottom: "20px",
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
                  gap: "12px",
                  marginBottom: "20px",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    width: "45px",
                    height: "45px",
                    backgroundColor: "rgba(255,255,255,0.2)",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "22px",
                  }}
                >
                  🏢
                </div>
                <span
                  style={{ fontSize: "16px", fontWeight: 600, opacity: 0.9 }}
                >
                  {theme.portalTitle}
                </span>
              </div>
            )}

            <h1
              className="welcome-title"
              style={{
                fontWeight: theme.headingWeight,
                marginBottom: "15px",
                fontFamily: theme.headingFont,
                lineHeight: 1.1,
              }}
            >
              Welcome Back
            </h1>

            <p
              className="welcome-text"
              style={{
                opacity: 0.85,
                lineHeight: 1.6,
                marginBottom: "20px",
              }}
            >
              {theme.tagline}
            </p>
          </div>
        </div>

        {/* ========== RIGHT PANEL - Illustration & Login Form ========== */}
        <div className="right-panel">
          {/* Background Decorations - Movie/Carnival Theme like GIF */}
          <div
            className="decorative-elements"
            style={{
              position: "absolute",
              inset: 0,
              overflow: "hidden",
              pointerEvents: "none",
            }}
          >
            {/* Confetti Elements */}
            <div
              className="confetti"
              style={{
                position: "absolute",
                top: "15%",
                right: "20%",
                width: "12px",
                height: "12px",
                backgroundColor: theme.primary,
                opacity: 0.3,
                borderRadius: "2px",
                transform: "rotate(45deg)",
              }}
            />
            <div
              className="confetti"
              style={{
                position: "absolute",
                top: "25%",
                left: "15%",
                width: "8px",
                height: "8px",
                backgroundColor: theme.secondary,
                opacity: 0.4,
                borderRadius: "50%",
                animationDelay: "-1s",
              }}
            />
            <div
              className="confetti"
              style={{
                position: "absolute",
                bottom: "30%",
                right: "25%",
                width: "10px",
                height: "10px",
                backgroundColor: "#f59e0b",
                opacity: 0.5,
                borderRadius: "2px",
                animationDelay: "-2s",
              }}
            />
            <div
              className="confetti"
              style={{
                position: "absolute",
                top: "60%",
                left: "10%",
                width: "6px",
                height: "6px",
                backgroundColor: theme.primary,
                opacity: 0.3,
                animationDelay: "-0.5s",
              }}
            />
            <div
              className="confetti"
              style={{
                position: "absolute",
                bottom: "20%",
                left: "30%",
                width: "14px",
                height: "14px",
                backgroundColor: theme.secondary,
                opacity: 0.2,
                borderRadius: "3px",
                transform: "rotate(30deg)",
                animationDelay: "-1.5s",
              }}
            />

            {/* Decorative Shapes */}
            <div
              className="float-animation"
              style={{
                position: "absolute",
                top: "10%",
                right: "10%",
                width: "80px",
                height: "80px",
                border: `3px solid ${theme.primary}20`,
                borderRadius: "50%",
              }}
            />
            <div
              className="float-animation"
              style={{
                position: "absolute",
                bottom: "15%",
                right: "15%",
                width: "60px",
                height: "60px",
                border: `2px solid ${theme.secondary}15`,
                borderRadius: "12px",
                transform: "rotate(45deg)",
                animationDelay: "-2s",
              }}
            />

            {/* Large Faded Blob */}
            <div
              style={{
                position: "absolute",
                top: "-100px",
                right: "-100px",
                width: "300px",
                height: "300px",
                background: `radial-gradient(circle, ${theme.primary}10 0%, transparent 70%)`,
                borderRadius: "50%",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: "-50px",
                left: "10%",
                width: "200px",
                height: "200px",
                background: `radial-gradient(circle, ${theme.secondary}08 0%, transparent 70%)`,
                borderRadius: "50%",
              }}
            />
          </div>

          {/* Login Form Area */}
          <div className="form-area">
            <div className="form-container">
              {showForgotPassword ? (
                /* ===== FORGOT PASSWORD FORM ===== */
                <div>
                  <h2
                    className="form-title"
                    style={{
                      fontWeight: theme.headingWeight,
                      color: theme.text,
                      marginBottom: "10px",
                      fontFamily: theme.headingFont,
                    }}
                  >
                    Reset Password
                  </h2>
                  <p
                    style={{
                      color: theme.text,
                      opacity: 0.5,
                      marginBottom: "30px",
                      fontSize: "14px",
                      lineHeight: 1.6,
                    }}
                  >
                    Enter your email and we'll send you a reset link
                  </p>

                  {forgotSuccess ? (
                    <div style={{ textAlign: "center", padding: "30px 0" }}>
                      <div
                        style={{
                          width: "70px",
                          height: "70px",
                          background: `linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)`,
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          margin: "0 auto 20px",
                          fontSize: "32px",
                        }}
                      >
                        ✓
                      </div>
                      <p
                        style={{
                          color: theme.text,
                          marginBottom: "30px",
                          lineHeight: 1.7,
                          opacity: 0.8,
                          fontSize: "14px",
                        }}
                      >
                        Check your email for reset instructions
                      </p>
                      <button
                        onClick={() => {
                          setShowForgotPassword(false);
                          setForgotSuccess(false);
                          setForgotEmail("");
                        }}
                        className="signin-btn"
                        style={{
                          width: "100%",
                          padding: "16px",
                          background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`,
                          color: "white",
                          border: "none",
                          borderRadius: "12px",
                          fontSize: "15px",
                          fontWeight: 600,
                          cursor: "pointer",
                          transition: "all 0.3s",
                        }}
                      >
                        Back to Login
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleForgotPassword}>
                      <div style={{ marginBottom: "24px" }}>
                        <input
                          type="email"
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          placeholder="Email address"
                          required
                          style={{
                            width: "100%",
                            padding: "16px 20px",
                            border: `2px solid ${theme.border}`,
                            borderRadius: "12px",
                            fontSize: "15px",
                            boxSizing: "border-box",
                            backgroundColor: "white",
                            transition: "all 0.3s",
                          }}
                        />
                      </div>

                      {loginError && (
                        <div
                          style={{
                            backgroundColor: "#fef2f2",
                            color: "#991b1b",
                            padding: "14px 18px",
                            borderRadius: "10px",
                            fontSize: "13px",
                            marginBottom: "20px",
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                          }}
                        >
                          ⚠️ {loginError}
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={forgotLoading}
                        className="signin-btn"
                        style={{
                          width: "100%",
                          padding: "16px",
                          background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`,
                          color: "white",
                          border: "none",
                          borderRadius: "12px",
                          fontSize: "15px",
                          fontWeight: 600,
                          cursor: forgotLoading ? "not-allowed" : "pointer",
                          opacity: forgotLoading ? 0.7 : 1,
                          marginBottom: "14px",
                          transition: "all 0.3s",
                          boxShadow: `0 12px 30px -10px ${theme.primary}50`,
                        }}
                      >
                        {forgotLoading ? "Sending..." : "Send Reset Link"}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setShowForgotPassword(false);
                          setLoginError("");
                        }}
                        style={{
                          width: "100%",
                          padding: "16px",
                          backgroundColor: "transparent",
                          color: theme.text,
                          border: `2px solid ${theme.border}`,
                          borderRadius: "12px",
                          fontSize: "14px",
                          fontWeight: 600,
                          cursor: "pointer",
                          transition: "all 0.3s",
                        }}
                      >
                        ← Back to Login
                      </button>
                    </form>
                  )}
                </div>
              ) : (
                /* ===== LOGIN FORM ===== */
                <div>
                  <h2
                    className="form-title"
                    style={{
                      fontWeight: theme.headingWeight,
                      color: theme.text,
                      marginBottom: "10px",
                      fontFamily: theme.headingFont,
                    }}
                  >
                    {showOtpLogin ? "Sign In with OTP" : "Sign In"}
                  </h2>
                  <p
                    style={{
                      color: theme.text,
                      opacity: 0.5,
                      marginBottom: "25px",
                      fontSize: "14px",
                    }}
                  >
                    Access your employee benefits portal
                  </p>

                  {/* Login Method Selector */}
                  <div style={{ marginBottom: "20px" }}>
                    <label
                      style={{
                        display: "block",
                        fontSize: "13px",
                        color: theme.text,
                        opacity: 0.7,
                        marginBottom: "8px",
                        fontWeight: 500,
                      }}
                    >
                      Login With
                    </label>
                    <select
                      value={loginMethod}
                      onChange={(e) => setLoginMethod(e.target.value as any)}
                      style={{
                        width: "100%",
                        padding: "14px 16px",
                        border: `2px solid ${theme.border}`,
                        borderRadius: "12px",
                        fontSize: "14px",
                        backgroundColor: "white",
                        cursor: "pointer",
                        color: theme.text,
                        appearance: "none",
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "right 14px center",
                        transition: "all 0.3s",
                      }}
                    >
                      <option value="email">Registered Email</option>
                      <option value="mobile">Mobile Number</option>
                      <option value="userid">User ID</option>
                      <option value="employeeid">Employee ID</option>
                    </select>
                  </div>

                  <form onSubmit={showOtpLogin ? handleOtpLogin : handleLogin}>
                    <div style={{ marginBottom: "20px" }}>
                      <input
                        id="login-input"
                        type={loginMethod === "email" ? "email" : "text"}
                        value={employeeId}
                        onChange={(e) => setEmployeeId(e.target.value)}
                        placeholder={getLoginMethodPlaceholder()}
                        style={{
                          width: "100%",
                          padding: "16px 20px",
                          border: `2px solid ${theme.border}`,
                          borderRadius: "12px",
                          fontSize: "15px",
                          boxSizing: "border-box",
                          backgroundColor: "white",
                          transition: "all 0.3s",
                        }}
                      />
                    </div>

                    {showOtpLogin ? (
                      /* OTP Input Section */
                      <div style={{ marginBottom: "20px" }}>
                        {!otpSent ? (
                          <button
                            type="button"
                            onClick={handleSendOtp}
                            disabled={sendingOtp || !employeeId}
                            style={{
                              width: "100%",
                              padding: "16px",
                              background: `linear-gradient(135deg, ${theme.secondary} 0%, ${theme.primary} 100%)`,
                              color: "white",
                              border: "none",
                              borderRadius: "12px",
                              fontSize: "14px",
                              fontWeight: 600,
                              cursor:
                                sendingOtp || !employeeId
                                  ? "not-allowed"
                                  : "pointer",
                              opacity: sendingOtp || !employeeId ? 0.7 : 1,
                              transition: "all 0.3s",
                            }}
                          >
                            {sendingOtp ? "Sending OTP..." : "📱 Send OTP"}
                          </button>
                        ) : (
                          <div>
                            <p
                              style={{
                                fontSize: "13px",
                                color: theme.primary,
                                marginBottom: "12px",
                                fontWeight: 500,
                              }}
                            >
                              ✅ OTP sent! Check your{" "}
                              {loginMethod === "email" ? "email" : "phone"}
                            </p>
                            <input
                              type="text"
                              value={otp}
                              onChange={(e) =>
                                setOtp(
                                  e.target.value.replace(/\D/g, "").slice(0, 6),
                                )
                              }
                              placeholder="Enter 6-digit OTP"
                              maxLength={6}
                              style={{
                                width: "100%",
                                padding: "16px 20px",
                                border: `2px solid ${theme.border}`,
                                borderRadius: "12px",
                                fontSize: "18px",
                                boxSizing: "border-box",
                                backgroundColor: "white",
                                textAlign: "center",
                                letterSpacing: "8px",
                                fontWeight: 600,
                                transition: "all 0.3s",
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setOtpSent(false);
                                setOtp("");
                                handleSendOtp();
                              }}
                              style={{
                                background: "none",
                                border: "none",
                                color: theme.primary,
                                fontSize: "12px",
                                cursor: "pointer",
                                marginTop: "8px",
                              }}
                            >
                              Resend OTP
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Password Input */
                      <div style={{ marginBottom: "20px" }}>
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Password"
                          style={{
                            width: "100%",
                            padding: "16px 20px",
                            border: `2px solid ${theme.border}`,
                            borderRadius: "12px",
                            fontSize: "15px",
                            boxSizing: "border-box",
                            backgroundColor: "white",
                            transition: "all 0.3s",
                          }}
                        />
                      </div>
                    )}

                    {/* Remember Me & Forgot Password */}
                    {!showOtpLogin &&
                      (loginSettings.showRememberMe ||
                        loginSettings.showForgotPassword) && (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: "20px",
                          }}
                        >
                          {loginSettings.showRememberMe && (
                            <label
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                fontSize: "13px",
                                color: theme.text,
                                cursor: "pointer",
                                opacity: 0.7,
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) =>
                                  setRememberMe(e.target.checked)
                                }
                                style={{
                                  width: "16px",
                                  height: "16px",
                                  accentColor: theme.primary,
                                  cursor: "pointer",
                                }}
                              />
                              Remember me
                            </label>
                          )}
                          {loginSettings.showForgotPassword && (
                            <button
                              type="button"
                              onClick={() => {
                                setShowForgotPassword(true);
                                setLoginError("");
                              }}
                              style={{
                                background: "none",
                                border: "none",
                                color: theme.primary,
                                fontSize: "13px",
                                fontWeight: 600,
                                cursor: "pointer",
                              }}
                            >
                              Forgot password?
                            </button>
                          )}
                        </div>
                      )}

                    {/* Consent Checkbox */}
                    {loginSettings.showConsent && (
                      <div
                        style={{
                          marginBottom: "20px",
                          padding: "14px",
                          backgroundColor: `${theme.primary}08`,
                          borderRadius: "12px",
                          border: `1px solid ${theme.primary}20`,
                        }}
                      >
                        <label
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "10px",
                            fontSize: "13px",
                            color: theme.text,
                            cursor: "pointer",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={consentChecked}
                            onChange={(e) =>
                              setConsentChecked(e.target.checked)
                            }
                            style={{
                              width: "18px",
                              height: "18px",
                              accentColor: theme.primary,
                              cursor: "pointer",
                              marginTop: "2px",
                              flexShrink: 0,
                            }}
                          />
                          <span>
                            {compliancePolicies?.consent_checkbox_text || (
                              <>
                                I agree to the{" "}
                                <button
                                  type="button"
                                  onClick={() => setShowPrivacyModal(true)}
                                  style={{
                                    background: "none",
                                    border: "none",
                                    color: theme.primary,
                                    fontWeight: 600,
                                    cursor: "pointer",
                                    padding: 0,
                                    textDecoration: "underline",
                                  }}
                                >
                                  Privacy Policy
                                </button>
                                ,{" "}
                                <button
                                  type="button"
                                  onClick={() => setShowTermsModal(true)}
                                  style={{
                                    background: "none",
                                    border: "none",
                                    color: theme.primary,
                                    fontWeight: 600,
                                    cursor: "pointer",
                                    padding: 0,
                                    textDecoration: "underline",
                                  }}
                                >
                                  Terms & Conditions
                                </button>{" "}
                                and{" "}
                                <button
                                  type="button"
                                  onClick={() => setShowDisclaimerModal(true)}
                                  style={{
                                    background: "none",
                                    border: "none",
                                    color: theme.primary,
                                    fontWeight: 600,
                                    cursor: "pointer",
                                    padding: 0,
                                    textDecoration: "underline",
                                  }}
                                >
                                  Disclaimer
                                </button>
                              </>
                            )}
                          </span>
                        </label>
                        {compliancePolicies?.consent_checkbox_text && (
                          <div
                            style={{
                              marginTop: "6px",
                              marginLeft: "28px",
                              fontSize: "12px",
                              display: "flex",
                              gap: "12px",
                              flexWrap: "wrap",
                            }}
                          >
                            <button
                              type="button"
                              onClick={() => setShowPrivacyModal(true)}
                              style={{
                                background: "none",
                                border: "none",
                                color: theme.primary,
                                fontWeight: 500,
                                cursor: "pointer",
                                padding: 0,
                                textDecoration: "underline",
                              }}
                            >
                              Privacy Policy
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowTermsModal(true)}
                              style={{
                                background: "none",
                                border: "none",
                                color: theme.primary,
                                fontWeight: 500,
                                cursor: "pointer",
                                padding: 0,
                                textDecoration: "underline",
                              }}
                            >
                              Terms & Conditions
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowDisclaimerModal(true)}
                              style={{
                                background: "none",
                                border: "none",
                                color: theme.primary,
                                fontWeight: 500,
                                cursor: "pointer",
                                padding: 0,
                                textDecoration: "underline",
                              }}
                            >
                              Disclaimer
                            </button>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            setShowConsentDetails(!showConsentDetails)
                          }
                          style={{
                            background: "none",
                            border: "none",
                            color: theme.primary,
                            fontSize: "12px",
                            cursor: "pointer",
                            marginTop: "8px",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          {showConsentDetails
                            ? "▲ Hide details"
                            : "▼ Show details"}
                        </button>
                        {showConsentDetails && (
                          <div
                            style={{
                              marginTop: "12px",
                              padding: "12px",
                              backgroundColor: "white",
                              borderRadius: "8px",
                              fontSize: "12px",
                              lineHeight: "1.6",
                              color: theme.text,
                              opacity: 0.8,
                            }}
                          >
                            {compliancePolicies?.consent_details_content ? (
                              <div
                                dangerouslySetInnerHTML={{
                                  __html:
                                    compliancePolicies.consent_details_content,
                                }}
                              />
                            ) : (
                              <>
                                <p style={{ margin: "0 0 8px 0" }}>
                                  <strong>
                                    By signing in, you acknowledge and agree
                                    that:
                                  </strong>
                                </p>
                                <ul style={{ margin: 0, paddingLeft: "18px" }}>
                                  <li>
                                    Your personal data will be processed in
                                    accordance with our Privacy Policy
                                  </li>
                                  <li>
                                    We may collect usage data to improve our
                                    services
                                  </li>
                                  <li>
                                    Your employer may have access to certain
                                    benefits-related information
                                  </li>
                                  <li>
                                    You consent to receive notifications related
                                    to your benefits
                                  </li>
                                  <li>
                                    All activities are logged for security and
                                    audit purposes
                                  </li>
                                </ul>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* ReCAPTCHA - only for password login */}
                    {!showOtpLogin && (
                      <div
                        style={{
                          marginBottom: "20px",
                          display: "flex",
                          justifyContent: "center",
                          transform: "scale(0.85)",
                          transformOrigin: "center",
                        }}
                      >
                        <ReCAPTCHA
                          ref={recaptchaRef}
                          sitekey={
                            process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ||
                            "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
                          }
                          onChange={(token) => setCaptchaToken(token)}
                        />
                      </div>
                    )}

                    {loginError && (
                      <div
                        style={{
                          backgroundColor: "#fef2f2",
                          color: "#991b1b",
                          padding: "14px 18px",
                          borderRadius: "10px",
                          fontSize: "13px",
                          marginBottom: "20px",
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        ⚠️ {loginError}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={
                        loggingIn ||
                        (loginSettings.showConsent && !consentChecked) ||
                        (showOtpLogin && (!otpSent || otp.length !== 6))
                      }
                      className="signin-btn"
                      style={{
                        width: "100%",
                        padding: "18px",
                        background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`,
                        color: "white",
                        border: "none",
                        borderRadius: "12px",
                        fontSize: "16px",
                        fontWeight: 600,
                        cursor:
                          loggingIn ||
                          (loginSettings.showConsent && !consentChecked)
                            ? "not-allowed"
                            : "pointer",
                        opacity:
                          loggingIn ||
                          (loginSettings.showConsent && !consentChecked)
                            ? 0.7
                            : 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "10px",
                        boxShadow: `0 15px 35px -12px ${theme.primary}60`,
                        transition: "all 0.3s",
                      }}
                    >
                      {loggingIn ? (
                        <>
                          <span
                            style={{
                              width: "20px",
                              height: "20px",
                              border: "3px solid transparent",
                              borderTopColor: "white",
                              borderRadius: "50%",
                              animation: "spin 0.7s linear infinite",
                            }}
                          />
                          Signing in...
                        </>
                      ) : (
                        "Sign In"
                      )}
                    </button>

                    {/* Toggle OTP / Password Login - Only show if OTP login is enabled */}
                    {loginSettings.enableOtpLogin && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowOtpLogin(!showOtpLogin);
                          setOtpSent(false);
                          setOtp("");
                          setLoginError("");
                        }}
                        style={{
                          width: "100%",
                          marginTop: "12px",
                          padding: "14px",
                          background: "transparent",
                          color: theme.primary,
                          border: `2px solid ${theme.primary}40`,
                          borderRadius: "12px",
                          fontSize: "14px",
                          fontWeight: 600,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "8px",
                          transition: "all 0.3s",
                        }}
                      >
                        {showOtpLogin
                          ? "🔐 Sign in with Password"
                          : "📱 Sign in with OTP"}
                      </button>
                    )}
                  </form>
                </div>
              )}

              {/* Footer */}
              <div
                style={{
                  textAlign: "center",
                  marginTop: "30px",
                  paddingTop: "20px",
                  borderTop: `1px solid ${theme.border}`,
                }}
              >
                <p
                  style={{
                    color: theme.text,
                    opacity: 0.3,
                    fontSize: "11px",
                    margin: 0,
                  }}
                >
                  Powered by <strong>BenefitNest</strong> • v2.1
                </p>
              </div>
            </div>
          </div>

          {/* Privacy Policy Modal */}
          {showPrivacyModal && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div
                  className="modal-header"
                  style={{ borderBottom: `1px solid ${theme.border}` }}
                >
                  <h3
                    style={{ margin: 0, fontSize: "20px", color: theme.text }}
                  >
                    🔒{" "}
                    {compliancePolicies?.privacy_policy_title ||
                      "Privacy Policy"}
                  </h3>
                  <button
                    onClick={() => setShowPrivacyModal(false)}
                    style={{
                      background: "none",
                      border: "none",
                      fontSize: "24px",
                      cursor: "pointer",
                      color: theme.text,
                      opacity: 0.5,
                      padding: "5px",
                    }}
                  >
                    ×
                  </button>
                </div>
                <div className="modal-body" style={{ color: theme.text }}>
                  {compliancePolicies?.privacy_policy_content ? (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: compliancePolicies.privacy_policy_content,
                      }}
                    />
                  ) : (
                    <>
                      <p>
                        <strong>Effective Date:</strong> January 1, 2024
                      </p>
                      <h4>1. Information We Collect</h4>
                      <p>
                        We collect personal information that you provide
                        directly to us, including but not limited to: name,
                        email address, employee ID, contact information, and
                        benefits-related data.
                      </p>
                      <h4>2. How We Use Your Information</h4>
                      <p>
                        We use the information we collect to: provide and
                        maintain our services, process your benefits elections,
                        communicate with you about your benefits, and comply
                        with legal obligations.
                      </p>
                      <h4>3. Contact Us</h4>
                      <p>
                        If you have any questions about this Privacy Policy,
                        please contact us at privacy@benefitnest.space
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Terms & Conditions Modal */}
          {showTermsModal && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div
                  className="modal-header"
                  style={{ borderBottom: `1px solid ${theme.border}` }}
                >
                  <h3
                    style={{ margin: 0, fontSize: "20px", color: theme.text }}
                  >
                    📜{" "}
                    {compliancePolicies?.terms_conditions_title ||
                      "Terms & Conditions"}
                  </h3>
                  <button
                    onClick={() => setShowTermsModal(false)}
                    style={{
                      background: "none",
                      border: "none",
                      fontSize: "24px",
                      cursor: "pointer",
                      color: theme.text,
                      opacity: 0.5,
                      padding: "5px",
                    }}
                  >
                    ×
                  </button>
                </div>
                <div className="modal-body" style={{ color: theme.text }}>
                  {compliancePolicies?.terms_conditions_content ? (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: compliancePolicies.terms_conditions_content,
                      }}
                    />
                  ) : (
                    <>
                      <p>
                        <strong>Last Updated:</strong> January 1, 2024
                      </p>
                      <h4>1. Acceptance of Terms</h4>
                      <p>
                        By accessing and using this Employee Benefits Portal,
                        you accept and agree to be bound by these Terms and
                        Conditions.
                      </p>
                      <h4>2. User Account</h4>
                      <p>
                        You are responsible for maintaining the confidentiality
                        of your login credentials.
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Disclaimer Modal */}
          {showDisclaimerModal && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div
                  className="modal-header"
                  style={{ borderBottom: `1px solid ${theme.border}` }}
                >
                  <h3
                    style={{ margin: 0, fontSize: "20px", color: theme.text }}
                  >
                    ⚠️ {compliancePolicies?.disclaimer_title || "Disclaimer"}
                  </h3>
                  <button
                    onClick={() => setShowDisclaimerModal(false)}
                    style={{
                      background: "none",
                      border: "none",
                      fontSize: "24px",
                      cursor: "pointer",
                      color: theme.text,
                      opacity: 0.5,
                      padding: "5px",
                    }}
                  >
                    ×
                  </button>
                </div>
                <div className="modal-body" style={{ color: theme.text }}>
                  {compliancePolicies?.disclaimer_content ? (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: compliancePolicies.disclaimer_content,
                      }}
                    />
                  ) : (
                    <>
                      <h4>General Disclaimer</h4>
                      <p>
                        The information provided on this Employee Benefits
                        Portal is for general informational purposes only.
                      </p>
                      <h4>Not Professional Advice</h4>
                      <p>
                        The content on this portal does not constitute
                        professional financial, legal, medical, or tax advice.
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* DPA Modal (for GDPR countries) */}
          {showDpaModal && compliancePolicies?.dpa_required && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div
                  className="modal-header"
                  style={{ borderBottom: `1px solid ${theme.border}` }}
                >
                  <h3
                    style={{ margin: 0, fontSize: "20px", color: theme.text }}
                  >
                    📋{" "}
                    {compliancePolicies?.dpa_title ||
                      "Data Processing Agreement"}
                  </h3>
                  <button
                    onClick={() => setShowDpaModal(false)}
                    style={{
                      background: "none",
                      border: "none",
                      fontSize: "24px",
                      cursor: "pointer",
                      color: theme.text,
                      opacity: 0.5,
                      padding: "5px",
                    }}
                  >
                    ×
                  </button>
                </div>
                <div className="modal-body" style={{ color: theme.text }}>
                  {compliancePolicies?.dpa_content ? (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: compliancePolicies.dpa_content,
                      }}
                    />
                  ) : (
                    <p>Data Processing Agreement content not available.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// PORTAL DASHBOARD (After Login)
// ============================================
interface MarketplaceSettings {
  marketplace_enabled?: boolean;
  marketplace_title?: string;
  show_wallet?: boolean;
  initial_wallet_balance?: number;
  wallet_currency?: string;
  [key: string]: any;
}

interface WellnessSettings {
  wellness_enabled?: boolean;
  show_health_risk_assessment?: boolean;
  show_ai_wellness_coach?: boolean;
  show_fitness_tracker?: boolean;
  show_mental_health?: boolean;
  show_nutrition_guide?: boolean;
  show_sleep_tracker?: boolean;
  [key: string]: any;
}

interface PortalDashboardProps {
  config: PortalConfig;
  customizations: Customizations | null;
  theme: any;
  onLogout: () => void;
}

function PortalDashboard({
  config,
  customizations,
  theme,
  onLogout,
}: PortalDashboardProps) {
  const [activeView, setActiveView] = useState<
    "dashboard" | "wellness" | "marketplace"
  >("dashboard");
  const [activeTab, setActiveTab] = useState<
    "overview" | "features" | "contact"
  >("overview");
  const [marketplaceSettings, setMarketplaceSettings] =
    useState<MarketplaceSettings | null>(null);
  const [wellnessSettings, setWellnessSettings] =
    useState<WellnessSettings | null>(null);
  const finalConfig = useMemo(
    () => (customizations ? { ...config, ...customizations } : config),
    [config, customizations],
  );

  // Fetch feature settings
  useEffect(() => {
    const fetchFeatureSettings = async () => {
      try {
        // Fetch marketplace settings
        const marketplaceRes = await fetch(
          `${API_URL}/api/portal/marketplace-settings/${config.subdomain}`,
        );
        if (marketplaceRes.ok) {
          const data = await marketplaceRes.json();
          if (data.success) setMarketplaceSettings(data.data);
        }
      } catch (err) {
        console.log("Marketplace settings not available");
      }

      try {
        // Fetch wellness settings
        const wellnessRes = await fetch(
          `${API_URL}/api/portal/wellness-settings/${config.subdomain}`,
        );
        if (wellnessRes.ok) {
          const data = await wellnessRes.json();
          if (data.success) setWellnessSettings(data.data);
        }
      } catch (err) {
        console.log("Wellness settings not available");
      }
    };

    fetchFeatureSettings();
  }, [config.subdomain]);

  // Check if features are enabled
  const isMarketplaceEnabled =
    marketplaceSettings?.marketplace_enabled !== false;
  const isWellnessEnabled = wellnessSettings?.wellness_enabled !== false;

  // Feature tiles for main dashboard
  const featureTiles = useMemo(() => {
    const tiles = [];

    if (isWellnessEnabled) {
      tiles.push({
        id: "wellness",
        icon: "🧘",
        title: "Wellness & Well-Being",
        desc: "Health assessments, fitness tracking, mental health support",
        color: "#10b981",
        gradient: "linear-gradient(135deg, #10b981, #059669)",
      });
    }

    if (isMarketplaceEnabled) {
      tiles.push({
        id: "marketplace",
        icon: "🛍️",
        title: "Employee Marketplace",
        desc: `Shop with your benefits wallet (${marketplaceSettings?.wallet_currency || "₹"}${(marketplaceSettings?.initial_wallet_balance || 5000).toLocaleString()})`,
        color: "#6366f1",
        gradient: "linear-gradient(135deg, #6366f1, #8b5cf6)",
      });
    }

    return tiles;
  }, [isWellnessEnabled, isMarketplaceEnabled, marketplaceSettings]);

  // Render Marketplace View
  if (activeView === "marketplace" && isMarketplaceEnabled) {
    return (
      <MarketplacePage
        settings={marketplaceSettings || {}}
        theme={theme}
        companyName={config.company_name}
        onBack={() => setActiveView("dashboard")}
        isPreview={false}
      />
    );
  }

  // Render Wellness View
  if (activeView === "wellness" && isWellnessEnabled) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: `linear-gradient(135deg, #10b981 0%, #059669 100%)`,
          padding: "25px",
          fontFamily: theme.bodyFont,
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div
            style={{
              backgroundColor: theme.background,
              borderRadius: "24px",
              padding: "40px",
              boxShadow: "0 25px 60px rgba(0,0,0,0.15)",
              color: theme.text,
            }}
          >
            {/* Back Button */}
            <button
              onClick={() => setActiveView("dashboard")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 20px",
                backgroundColor: "#f3f4f6",
                color: "#374151",
                border: "none",
                borderRadius: "10px",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                marginBottom: "24px",
              }}
            >
              ← Back to Dashboard
            </button>

            {/* Wellness Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                marginBottom: "32px",
              }}
            >
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "16px",
                  background: "linear-gradient(135deg, #10b981, #059669)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "32px",
                }}
              >
                🧘
              </div>
              <div>
                <h1
                  style={{
                    fontSize: "28px",
                    fontWeight: 700,
                    margin: 0,
                    color: "#10b981",
                  }}
                >
                  Wellness & Well-Being
                </h1>
                <p
                  style={{
                    fontSize: "14px",
                    color: theme.text,
                    opacity: 0.6,
                    margin: "4px 0 0 0",
                  }}
                >
                  Your holistic health and wellness center
                </p>
              </div>
            </div>

            {/* Wellness Tiles */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "20px",
              }}
            >
              {wellnessSettings?.show_health_risk_assessment !== false && (
                <div
                  style={{
                    padding: "24px",
                    border: "1px solid #e5e7eb",
                    borderRadius: "16px",
                    cursor: "pointer",
                    transition: "all 0.3s",
                    backgroundColor: "white",
                  }}
                >
                  <div style={{ fontSize: "40px", marginBottom: "12px" }}>
                    📊
                  </div>
                  <h3
                    style={{
                      fontSize: "18px",
                      fontWeight: 600,
                      color: "#111827",
                      margin: "0 0 8px 0",
                    }}
                  >
                    Health Risk Assessment
                  </h3>
                  <p style={{ fontSize: "13px", color: "#6b7280", margin: 0 }}>
                    Complete your health questionnaire and get personalized
                    insights
                  </p>
                </div>
              )}
              {wellnessSettings?.show_ai_wellness_coach !== false && (
                <div
                  style={{
                    padding: "24px",
                    border: "1px solid #e5e7eb",
                    borderRadius: "16px",
                    cursor: "pointer",
                    transition: "all 0.3s",
                    backgroundColor: "white",
                  }}
                >
                  <div style={{ fontSize: "40px", marginBottom: "12px" }}>
                    🤖
                  </div>
                  <h3
                    style={{
                      fontSize: "18px",
                      fontWeight: 600,
                      color: "#111827",
                      margin: "0 0 8px 0",
                    }}
                  >
                    AI Wellness Coach
                  </h3>
                  <p style={{ fontSize: "13px", color: "#6b7280", margin: 0 }}>
                    Get personalized health advice from our AI-powered coach
                  </p>
                </div>
              )}
              {wellnessSettings?.show_fitness_tracker !== false && (
                <div
                  style={{
                    padding: "24px",
                    border: "1px solid #e5e7eb",
                    borderRadius: "16px",
                    cursor: "pointer",
                    transition: "all 0.3s",
                    backgroundColor: "white",
                  }}
                >
                  <div style={{ fontSize: "40px", marginBottom: "12px" }}>
                    🏃
                  </div>
                  <h3
                    style={{
                      fontSize: "18px",
                      fontWeight: 600,
                      color: "#111827",
                      margin: "0 0 8px 0",
                    }}
                  >
                    Fitness Tracker
                  </h3>
                  <p style={{ fontSize: "13px", color: "#6b7280", margin: 0 }}>
                    Track your steps, workouts, and fitness goals
                  </p>
                </div>
              )}
              {wellnessSettings?.show_mental_health !== false && (
                <div
                  style={{
                    padding: "24px",
                    border: "1px solid #e5e7eb",
                    borderRadius: "16px",
                    cursor: "pointer",
                    transition: "all 0.3s",
                    backgroundColor: "white",
                  }}
                >
                  <div style={{ fontSize: "40px", marginBottom: "12px" }}>
                    🧠
                  </div>
                  <h3
                    style={{
                      fontSize: "18px",
                      fontWeight: 600,
                      color: "#111827",
                      margin: "0 0 8px 0",
                    }}
                  >
                    Mental Health
                  </h3>
                  <p style={{ fontSize: "13px", color: "#6b7280", margin: 0 }}>
                    Meditation guides, stress management, and EAP resources
                  </p>
                </div>
              )}
              {wellnessSettings?.show_nutrition_guide !== false && (
                <div
                  style={{
                    padding: "24px",
                    border: "1px solid #e5e7eb",
                    borderRadius: "16px",
                    cursor: "pointer",
                    transition: "all 0.3s",
                    backgroundColor: "white",
                  }}
                >
                  <div style={{ fontSize: "40px", marginBottom: "12px" }}>
                    🥗
                  </div>
                  <h3
                    style={{
                      fontSize: "18px",
                      fontWeight: 600,
                      color: "#111827",
                      margin: "0 0 8px 0",
                    }}
                  >
                    Nutrition Guide
                  </h3>
                  <p style={{ fontSize: "13px", color: "#6b7280", margin: 0 }}>
                    Meal plans, calorie tracking, and nutritional advice
                  </p>
                </div>
              )}
              {wellnessSettings?.show_sleep_tracker !== false && (
                <div
                  style={{
                    padding: "24px",
                    border: "1px solid #e5e7eb",
                    borderRadius: "16px",
                    cursor: "pointer",
                    transition: "all 0.3s",
                    backgroundColor: "white",
                  }}
                >
                  <div style={{ fontSize: "40px", marginBottom: "12px" }}>
                    😴
                  </div>
                  <h3
                    style={{
                      fontSize: "18px",
                      fontWeight: 600,
                      color: "#111827",
                      margin: "0 0 8px 0",
                    }}
                  >
                    Sleep Tracker
                  </h3>
                  <p style={{ fontSize: "13px", color: "#6b7280", margin: 0 }}>
                    Monitor sleep patterns and improve sleep quality
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Dashboard View
  return (
    <div
      style={{
        minHeight: "100vh",
        background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`,
        padding: "25px",
        fontFamily: theme.bodyFont,
      }}
    >
      <style>{`
        * { font-family: ${theme.bodyFont}, sans-serif; } 
        h1, h2, h3, h4, h5, h6 { font-family: ${theme.headingFont}, sans-serif; font-weight: ${theme.headingWeight}; } 
        .feature-card:hover { transform: translateY(-5px); box-shadow: 0 15px 40px rgba(0,0,0,0.1) !important; }
        .feature-tile:hover { transform: translateY(-8px); box-shadow: 0 20px 50px rgba(0,0,0,0.2) !important; }
        ${theme.customCss}
      `}</style>

      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div
          style={{
            backgroundColor: theme.background,
            borderRadius: "24px",
            padding: "40px",
            boxShadow: "0 25px 60px rgba(0,0,0,0.15)",
            color: theme.text,
          }}
        >
          {/* Header */}
          {finalConfig.show_header !== false && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "40px",
                paddingBottom: "30px",
                borderBottom: `1px solid ${theme.border}`,
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "22px" }}
              >
                <div
                  style={{
                    width: "75px",
                    height: "75px",
                    borderRadius: "18px",
                    background: `linear-gradient(135deg, ${theme.primary}15 0%, ${theme.secondary}15 100%)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                  }}
                >
                  {theme.logoUrl ? (
                    <img
                      src={theme.logoUrl}
                      alt={config.company_name}
                      style={{
                        maxWidth: "100%",
                        maxHeight: "100%",
                        objectFit: "contain",
                      }}
                    />
                  ) : (
                    <span style={{ fontSize: "36px" }}>🏢</span>
                  )}
                </div>
                <div>
                  <h1
                    style={{
                      fontSize: "26px",
                      fontWeight: theme.headingWeight,
                      margin: "0 0 6px 0",
                      background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    {theme.portalTitle}
                  </h1>
                  <p
                    style={{
                      fontSize: "14px",
                      color: theme.text,
                      margin: 0,
                      opacity: 0.55,
                    }}
                  >
                    Employee Benefits Portal
                  </p>
                </div>
              </div>
              <button
                onClick={onLogout}
                style={{
                  padding: "14px 28px",
                  backgroundColor: "#fef2f2",
                  color: "#991b1b",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.3s",
                }}
              >
                Logout
              </button>
            </div>
          )}

          {/* Feature Tiles - Main Services */}
          {featureTiles.length > 0 && (
            <div style={{ marginBottom: "40px" }}>
              <h2
                style={{
                  fontSize: "20px",
                  fontWeight: 700,
                  marginBottom: "20px",
                  color: theme.text,
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <span>🚀</span> Your Benefits & Services
              </h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                  gap: "20px",
                }}
              >
                {featureTiles.map((tile) => (
                  <div
                    key={tile.id}
                    className="feature-tile"
                    onClick={() => setActiveView(tile.id as any)}
                    style={{
                      padding: "28px",
                      background: tile.gradient,
                      borderRadius: "20px",
                      cursor: "pointer",
                      transition: "all 0.3s",
                      color: "white",
                      boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                    }}
                  >
                    <div style={{ fontSize: "48px", marginBottom: "16px" }}>
                      {tile.icon}
                    </div>
                    <h3
                      style={{
                        fontSize: "22px",
                        fontWeight: 700,
                        margin: "0 0 8px 0",
                      }}
                    >
                      {tile.title}
                    </h3>
                    <p style={{ fontSize: "14px", margin: 0, opacity: 0.9 }}>
                      {tile.desc}
                    </p>
                    <div
                      style={{
                        marginTop: "20px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "10px 20px",
                        backgroundColor: "rgba(255,255,255,0.2)",
                        borderRadius: "10px",
                        fontSize: "14px",
                        fontWeight: 600,
                      }}
                    >
                      Explore →
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Status Badge */}
          <div
            style={{
              display: "inline-block",
              padding: "12px 24px",
              background: "linear-gradient(135deg, #dcfce7 0%, #d1fae5 100%)",
              color: "#166534",
              borderRadius: "10px",
              fontSize: "14px",
              fontWeight: 600,
              marginBottom: "28px",
            }}
          >
            ✓ Portal Active
          </div>

          {/* Tab Navigation */}
          <div
            style={{
              display: "flex",
              gap: "12px",
              borderBottom: `1px solid ${theme.border}`,
              marginBottom: "40px",
            }}
          >
            {(["overview", "features", "contact"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: "16px 28px",
                  border: "none",
                  background:
                    activeTab === tab
                      ? `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`
                      : "transparent",
                  color: activeTab === tab ? "white" : theme.text,
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: 600,
                  borderRadius: "10px 10px 0 0",
                  fontFamily: theme.headingFont,
                  transition: "all 0.3s",
                }}
              >
                {tab === "overview" && "📋 Overview"}
                {tab === "features" && "⭐ Features"}
                {tab === "contact" && "📞 Contact"}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === "overview" && (
            <div>
              <h3
                style={{
                  fontSize: "24px",
                  fontWeight: theme.headingWeight,
                  marginBottom: "18px",
                  background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Welcome to Your Benefits Portal
              </h3>
              <p
                style={{
                  fontSize: `${theme.bodySize}px`,
                  lineHeight: 1.8,
                  color: theme.text,
                  opacity: 0.75,
                }}
              >
                This is your dedicated employee benefits portal for{" "}
                {config.company_name}. Here you can manage your benefits, view
                policy details, and access important documents.
              </p>
            </div>
          )}

          {activeTab === "features" &&
            finalConfig.show_features_section !== false && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: "22px",
                }}
              >
                {[
                  {
                    icon: "📋",
                    title: "View Benefits",
                    desc: "See all your benefits",
                  },
                  {
                    icon: "📄",
                    title: "Documents",
                    desc: "Download documents",
                  },
                  { icon: "📊", title: "Claims", desc: "Track claims" },
                  { icon: "👤", title: "Profile", desc: "Manage your info" },
                  { icon: "🔔", title: "Alerts", desc: "Get notifications" },
                  { icon: "💬", title: "Support", desc: "Contact support" },
                ].map((f, i) => (
                  <div
                    key={i}
                    className="feature-card"
                    style={{
                      padding: "28px",
                      border: `1px solid ${theme.border}`,
                      borderRadius: "18px",
                      textAlign: "center",
                      cursor: "pointer",
                      transition: "all 0.3s",
                      backgroundColor: theme.background,
                    }}
                  >
                    <div style={{ fontSize: "40px", marginBottom: "14px" }}>
                      {f.icon}
                    </div>
                    <div
                      style={{
                        fontSize: "15px",
                        fontWeight: 600,
                        marginBottom: "6px",
                        color: theme.primary,
                      }}
                    >
                      {f.title}
                    </div>
                    <div
                      style={{
                        fontSize: "13px",
                        color: theme.text,
                        opacity: 0.55,
                      }}
                    >
                      {f.desc}
                    </div>
                  </div>
                ))}
              </div>
            )}

          {activeTab === "contact" &&
            finalConfig.show_contact_section !== false && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                  gap: "22px",
                }}
              >
                {(finalConfig.contact_email || config.contact_email) && (
                  <div
                    style={{
                      padding: "28px",
                      background: `linear-gradient(135deg, ${theme.primary}08 0%, ${theme.secondary}08 100%)`,
                      borderRadius: "18px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "12px",
                        color: theme.text,
                        marginBottom: "10px",
                        opacity: 0.5,
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                      }}
                    >
                      EMAIL
                    </div>
                    <a
                      href={`mailto:${finalConfig.contact_email || config.contact_email}`}
                      style={{
                        fontSize: "17px",
                        fontWeight: 600,
                        color: theme.primary,
                        textDecoration: "none",
                      }}
                    >
                      {finalConfig.contact_email || config.contact_email}
                    </a>
                  </div>
                )}
                {(finalConfig.contact_phone || config.contact_phone) && (
                  <div
                    style={{
                      padding: "28px",
                      background: `linear-gradient(135deg, ${theme.secondary}08 0%, ${theme.primary}08 100%)`,
                      borderRadius: "18px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "12px",
                        color: theme.text,
                        marginBottom: "10px",
                        opacity: 0.5,
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                      }}
                    >
                      PHONE
                    </div>
                    <a
                      href={`tel:${finalConfig.contact_phone || config.contact_phone}`}
                      style={{
                        fontSize: "17px",
                        fontWeight: 600,
                        color: theme.secondary,
                        textDecoration: "none",
                      }}
                    >
                      {finalConfig.contact_phone || config.contact_phone}
                    </a>
                  </div>
                )}
              </div>
            )}

          {/* Footer */}
          {finalConfig.show_footer !== false && (
            <div
              style={{
                marginTop: "50px",
                paddingTop: "28px",
                borderTop: `1px solid ${theme.border}`,
                textAlign: "center",
                fontSize: "13px",
                color: theme.text,
                opacity: 0.4,
              }}
            >
              <p>Powered by BenefitNest © {new Date().getFullYear()}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
