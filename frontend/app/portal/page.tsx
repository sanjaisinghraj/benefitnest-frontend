"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "https://benefitnest-backend.onrender.com";

interface TenantInfo {
  tenant_id: string;
  subdomain: string;
  corporate_legal_name: string;
  branding_config?: {
    primary_color?: string;
    secondary_color?: string;
    logo_url?: string;
  };
  status: string;
}

interface PortalCustomizations {
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
  background_color?: string;
  text_color?: string;
  border_color?: string;
  heading_font_family?: string;
  body_font_family?: string;
  heading_font_size?: number;
  body_font_size?: number;
  font_weight_heading?: number;
  font_weight_body?: number;
  line_height_multiplier?: number;
  logo_url?: string;
  logo_width?: number;
  logo_height?: number;
  portal_title?: string;
  portal_tagline?: string;
  hero_headline?: string;
  hero_subheadline?: string;
  custom_css?: string;
  [key: string]: any;
}

interface PortalConfig {
  tenant_id: string;
  company_name: string;
  subdomain: string;
  logo_url?: string;
  primary_color: string;
  secondary_color: string;
  status: string;
  customizations?: PortalCustomizations | null;
}

function PortalLoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tenant = searchParams.get("tenant") || "";

  const [tenantInfo, setTenantInfo] = useState<TenantInfo | null>(null);
  const [customizations, setCustomizations] =
    useState<PortalCustomizations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState("");

  useEffect(() => {
    const hostname = window.location.hostname;
    const parts = hostname.split(".");

    if (parts.length > 2) {
      const subdomain = parts[0];
      fetchPortalConfig(subdomain);
    } else if (tenant) {
      fetchPortalConfig(tenant);
    } else {
      setLoading(false);
      setError("Invalid portal URL");
    }
  }, [tenant]);

  const fetchPortalConfig = async (subdomain: string) => {
    try {
      const response = await fetch(`${API_URL}/api/portal/config/${subdomain}`);
      const data = await response.json();

      if (data.success && data.data) {
        setCustomizations(data.data.customizations || null);
        setTenantInfo({
          tenant_id: data.data.tenant_id,
          subdomain: data.data.subdomain,
          corporate_legal_name: data.data.company_name,
          branding_config: {
            primary_color: data.data.primary_color,
            secondary_color: data.data.secondary_color,
            logo_url: data.data.logo_url,
          },
          status: data.data.status,
        });
      } else {
        await fetchTenantInfo(subdomain);
      }
    } catch (err) {
      console.error("Failed to fetch portal config:", err);
      await fetchTenantInfo(subdomain);
    } finally {
      setLoading(false);
    }
  };

  const fetchTenantInfo = async (subdomain: string) => {
    try {
      const response = await fetch(`${API_URL}/api/portal/tenant/${subdomain}`);
      const data = await response.json();
      if (data.success && data.data) {
        setTenantInfo(data.data);
      } else {
        setError("Company not found");
      }
    } catch (err) {
      setError("Failed to load company information");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (!employeeId || !password) {
      setLoginError("Please enter Employee ID and Password");
      return;
    }

    setLoggingIn(true);

    try {
      const response = await fetch(`${API_URL}/api/portal/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenant_id: tenantInfo?.tenant_id,
          subdomain: tenantInfo?.subdomain,
          employee_id: employeeId,
          password: password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem("portal_token", data.token);
        localStorage.setItem("portal_user", JSON.stringify(data.user));
        localStorage.setItem("portal_tenant", JSON.stringify(tenantInfo));
        router.push("/portal/dashboard");
      } else {
        setLoginError(data.message || "Invalid credentials");
      }
    } catch (err) {
      setLoginError("Login failed. Please try again.");
    } finally {
      setLoggingIn(false);
    }
  };

  // =====================================================
  // APPLY CUSTOMIZATIONS - Priority: customizations > branding_config > defaults
  // =====================================================
  const primaryColor =
    customizations?.primary_color ||
    tenantInfo?.branding_config?.primary_color ||
    "#2563eb";
  const secondaryColor =
    customizations?.secondary_color ||
    tenantInfo?.branding_config?.secondary_color ||
    "#10b981";
  const accentColor = customizations?.accent_color || "#f59e0b";
  const backgroundColor = customizations?.background_color || "#ffffff";
  const textColor = customizations?.text_color || "#111827";
  const borderColor = customizations?.border_color || "#e5e7eb";

  const headingFont = customizations?.heading_font_family || "Segoe UI";
  const bodyFont = customizations?.body_font_family || "Segoe UI";
  const headingSize = customizations?.heading_font_size || 32;
  const bodySize = customizations?.body_font_size || 16;
  const headingWeight = customizations?.font_weight_heading || 700;
  const lineHeight = customizations?.line_height_multiplier || 1.6;

  const logoUrl =
    customizations?.logo_url || tenantInfo?.branding_config?.logo_url;
  const logoWidth = customizations?.logo_width || 150;
  const logoHeight = customizations?.logo_height || 80;

  const companyName =
    customizations?.portal_title ||
    tenantInfo?.corporate_legal_name ||
    "Employee Portal";
  const tagline = customizations?.portal_tagline || "Employee Benefits Portal";
  const customCss = customizations?.custom_css || "";

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
          fontFamily: bodyFont,
        }}
      >
        <div className="bg-white p-8 sm:p-10 rounded-xl sm:rounded-2xl text-center shadow-2xl max-w-sm w-full">
          <div
            className="w-10 h-10 sm:w-12 sm:h-12 border-4 rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: borderColor, borderTopColor: primaryColor }}
          />
          <p className="opacity-70 text-sm sm:text-base" style={{ color: textColor }}>
            Loading portal...
          </p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
          fontFamily: bodyFont,
        }}
      >
        <div className="bg-white p-6 sm:p-10 md:p-12 rounded-xl sm:rounded-2xl text-center shadow-2xl max-w-md w-full">
          <div className="text-4xl sm:text-5xl md:text-6xl mb-4">🏢</div>
          <h1
            className="text-xl sm:text-2xl font-bold mb-2"
            style={{ color: textColor, fontFamily: headingFont, fontWeight: headingWeight }}
          >
            Portal Not Found
          </h1>
          <p className="opacity-70 mb-6 text-sm sm:text-base" style={{ color: textColor }}>
            {error}
          </p>
          <a
            href="https://benefitnest.space"
            className="inline-block px-5 py-2.5 sm:px-6 sm:py-3 rounded-lg text-white font-semibold text-sm sm:text-base"
            style={{ backgroundColor: primaryColor }}
          >
            Go to Main Site
          </a>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col lg:flex-row"
      style={{
        background: `linear-gradient(135deg, ${primaryColor}15 0%, ${primaryColor}05 100%)`,
        fontFamily: bodyFont,
        fontSize: `${bodySize}px`,
        lineHeight: lineHeight,
        color: textColor,
      }}
    >
      <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                input::placeholder { color: ${textColor}; opacity: 0.5; }
                input:focus { border-color: ${primaryColor} !important; box-shadow: 0 0 0 3px ${primaryColor}20; outline: none; }
                ${customCss}
            `}</style>

      {/* Left side - Branding (hidden on mobile) */}
      <div
        className="hidden lg:flex flex-1 flex-col items-center justify-center p-8 lg:p-12 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
          color: "white",
        }}
      >
        {/* Background pattern */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.1,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div
          style={{
            position: "relative",
            textAlign: "center",
            maxWidth: "400px",
          }}
        >
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={companyName}
              style={{
                maxWidth: `${logoWidth}px`,
                maxHeight: `${logoHeight}px`,
                marginBottom: "32px",
                objectFit: "contain",
              }}
            />
          ) : (
            <div style={{ fontSize: "72px", marginBottom: "24px" }}>🏢</div>
          )}

          <h1
            style={{
              fontSize: `${headingSize}px`,
              fontWeight: headingWeight,
              marginBottom: "16px",
              fontFamily: headingFont,
            }}
          >
            {companyName}
          </h1>

          <p style={{ fontSize: "18px", opacity: 0.9, lineHeight: 1.6 }}>
            {tagline}
          </p>

          <div className="mt-8 lg:mt-12 flex gap-4 sm:gap-6 justify-center">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl mb-2">🏥</div>
              <div className="text-xs sm:text-sm opacity-80">
                Health Claims
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl mb-2">📋</div>
              <div className="text-xs sm:text-sm opacity-80">Policies</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl mb-2">👨‍👩‍👧‍👦</div>
              <div className="text-xs sm:text-sm opacity-80">Family</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div
        className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-12"
        style={{ backgroundColor: backgroundColor }}
      >
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-6 sm:mb-8">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={companyName}
                className="h-10 sm:h-12 mb-3 sm:mb-4 object-contain mx-auto"
              />
            ) : (
              <div className="text-4xl sm:text-5xl mb-2">🏢</div>
            )}
            <h1
              className="text-lg sm:text-xl font-bold"
              style={{ color: textColor, fontFamily: headingFont, fontWeight: headingWeight }}
            >
              {companyName}
            </h1>
          </div>

          <div
            className="bg-white p-5 sm:p-6 md:p-8 lg:p-10 rounded-xl sm:rounded-2xl shadow-lg"
            style={{ border: `1px solid ${borderColor}` }}
          >
            <h2
              className="text-xl sm:text-2xl font-bold mb-2 text-center"
              style={{ color: textColor, fontFamily: headingFont, fontWeight: headingWeight }}
            >
              Welcome Back
            </h2>
            <p
              className="text-center opacity-70 mb-6 sm:mb-8 text-sm sm:text-base"
              style={{ color: textColor }}
            >
              Sign in to access your benefits portal
            </p>

            <form onSubmit={handleLogin}>
              <div className="mb-4 sm:mb-5">
                <label
                  className="block text-xs sm:text-sm font-semibold mb-2"
                  style={{ color: textColor }}
                >
                  Employee ID / Email
                </label>
                <input
                  type="text"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  placeholder="Enter your employee ID or email"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base transition-all"
                  style={{
                    border: `1px solid ${borderColor}`,
                    backgroundColor: backgroundColor,
                  }}
                />
              </div>

              <div className="mb-5 sm:mb-6">
                <label
                  className="block text-xs sm:text-sm font-semibold mb-2"
                  style={{ color: textColor }}
                >
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base transition-all"
                  style={{
                    border: `1px solid ${borderColor}`,
                    backgroundColor: backgroundColor,
                  }}
                />
              </div>

              {loginError && (
                <div className="bg-red-100 text-red-800 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm mb-4 sm:mb-5 flex items-center gap-2">
                  <span>⚠️</span>
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                disabled={loggingIn}
                className="w-full py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                style={{ backgroundColor: primaryColor }}
              >
                {loggingIn ? (
                  <>
                    <span className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-transparent border-t-white rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            <div className="text-center mt-5 sm:mt-6">
              <a
                href="#"
                className="text-xs sm:text-sm font-medium no-underline"
                style={{ color: primaryColor }}
              >
                Forgot Password?
              </a>
            </div>
          </div>

          <div className="text-center mt-6 sm:mt-8 opacity-50 text-xs sm:text-sm">
            <p>
              Powered by <strong className="opacity-80">BenefitNest</strong>
            </p>
            <p className="mt-2">
              <a
                href="#"
                className="opacity-70 no-underline"
                style={{ color: textColor }}
              >
                Privacy Policy
              </a>
              {" • "}
              <a
                href="#"
                className="opacity-70 no-underline"
                style={{ color: textColor }}
              >
                Terms of Service
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PortalLoginPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100vh",
            backgroundColor: "#f3f4f6",
          }}
        >
          <div>Loading...</div>
        </div>
      }
    >
      <PortalLoginContent />
    </Suspense>
  );
}
