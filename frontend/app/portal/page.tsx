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
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
          fontFamily: bodyFont,
        }}
      >
        <div
          style={{
            backgroundColor: "white",
            padding: "40px",
            borderRadius: "16px",
            textAlign: "center",
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              border: `4px solid ${borderColor}`,
              borderTopColor: primaryColor,
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 16px",
            }}
          />
          <p style={{ color: textColor, margin: 0, opacity: 0.7 }}>
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
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
          fontFamily: bodyFont,
        }}
      >
        <div
          style={{
            backgroundColor: "white",
            padding: "48px",
            borderRadius: "16px",
            textAlign: "center",
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
            maxWidth: "400px",
          }}
        >
          <div style={{ fontSize: "64px", marginBottom: "16px" }}>🏢</div>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: headingWeight,
              color: textColor,
              marginBottom: "8px",
              fontFamily: headingFont,
            }}
          >
            Portal Not Found
          </h1>
          <p style={{ color: textColor, opacity: 0.7, marginBottom: "24px" }}>
            {error}
          </p>
          <a
            href="https://benefitnest.space"
            style={{
              display: "inline-block",
              padding: "12px 24px",
              backgroundColor: primaryColor,
              color: "white",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: "600",
            }}
          >
            Go to Main Site
          </a>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        background: `linear-gradient(135deg, ${primaryColor}15 0%, ${primaryColor}05 100%)`,
        fontFamily: bodyFont,
        fontSize: `${bodySize}px`,
        lineHeight: lineHeight,
        color: textColor,
      }}
    >
      <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                .hide-mobile { display: flex; }
                .show-mobile { display: none; }
                @media (max-width: 768px) {
                    .hide-mobile { display: none !important; }
                    .show-mobile { display: block !important; }
                }
                input::placeholder { color: ${textColor}; opacity: 0.5; }
                input:focus { border-color: ${primaryColor} !important; box-shadow: 0 0 0 3px ${primaryColor}20; outline: none; }
                ${customCss}
            `}</style>

      {/* Left side - Branding */}
      <div
        style={{
          flex: 1,
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px",
          color: "white",
          position: "relative",
          overflow: "hidden",
        }}
        className="hide-mobile"
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

          <div
            style={{
              marginTop: "48px",
              display: "flex",
              gap: "24px",
              justifyContent: "center",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "32px", marginBottom: "8px" }}>🏥</div>
              <div style={{ fontSize: "14px", opacity: 0.8 }}>
                Health Claims
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "32px", marginBottom: "8px" }}>📋</div>
              <div style={{ fontSize: "14px", opacity: 0.8 }}>Policies</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "32px", marginBottom: "8px" }}>👨‍👩‍👧‍👦</div>
              <div style={{ fontSize: "14px", opacity: 0.8 }}>Family</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px",
          backgroundColor: backgroundColor,
        }}
      >
        <div style={{ width: "100%", maxWidth: "420px" }}>
          {/* Mobile logo */}
          <div
            className="show-mobile"
            style={{ textAlign: "center", marginBottom: "32px" }}
          >
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={companyName}
                style={{
                  height: "48px",
                  marginBottom: "16px",
                  objectFit: "contain",
                }}
              />
            ) : (
              <div style={{ fontSize: "48px", marginBottom: "8px" }}>🏢</div>
            )}
            <h1
              style={{
                fontSize: "20px",
                fontWeight: headingWeight,
                color: textColor,
                margin: 0,
                fontFamily: headingFont,
              }}
            >
              {companyName}
            </h1>
          </div>

          <div
            style={{
              backgroundColor: "white",
              padding: "40px",
              borderRadius: "16px",
              boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
              border: `1px solid ${borderColor}`,
            }}
          >
            <h2
              style={{
                fontSize: "24px",
                fontWeight: headingWeight,
                color: textColor,
                marginBottom: "8px",
                textAlign: "center",
                fontFamily: headingFont,
              }}
            >
              Welcome Back
            </h2>
            <p
              style={{
                color: textColor,
                opacity: 0.7,
                textAlign: "center",
                marginBottom: "32px",
              }}
            >
              Sign in to access your benefits portal
            </p>

            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: textColor,
                    marginBottom: "8px",
                  }}
                >
                  Employee ID / Email
                </label>
                <input
                  type="text"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  placeholder="Enter your employee ID or email"
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    border: `1px solid ${borderColor}`,
                    borderRadius: "10px",
                    fontSize: "15px",
                    transition: "all 0.2s",
                    boxSizing: "border-box",
                    backgroundColor: backgroundColor,
                  }}
                />
              </div>

              <div style={{ marginBottom: "24px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: textColor,
                    marginBottom: "8px",
                  }}
                >
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    border: `1px solid ${borderColor}`,
                    borderRadius: "10px",
                    fontSize: "15px",
                    transition: "all 0.2s",
                    boxSizing: "border-box",
                    backgroundColor: backgroundColor,
                  }}
                />
              </div>

              {loginError && (
                <div
                  style={{
                    backgroundColor: "#fee2e2",
                    color: "#991b1b",
                    padding: "12px 16px",
                    borderRadius: "8px",
                    fontSize: "14px",
                    marginBottom: "20px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <span>⚠️</span>
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                disabled={loggingIn}
                style={{
                  width: "100%",
                  padding: "14px",
                  backgroundColor: primaryColor,
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: loggingIn ? "not-allowed" : "pointer",
                  opacity: loggingIn ? 0.7 : 1,
                  transition: "all 0.2s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                {loggingIn ? (
                  <>
                    <span
                      style={{
                        width: "18px",
                        height: "18px",
                        border: "2px solid transparent",
                        borderTopColor: "white",
                        borderRadius: "50%",
                        animation: "spin 0.6s linear infinite",
                      }}
                    />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            <div style={{ textAlign: "center", marginTop: "24px" }}>
              <a
                href="#"
                style={{
                  color: primaryColor,
                  fontSize: "14px",
                  textDecoration: "none",
                  fontWeight: "500",
                }}
              >
                Forgot Password?
              </a>
            </div>
          </div>

          <div
            style={{
              textAlign: "center",
              marginTop: "32px",
              color: textColor,
              opacity: 0.5,
              fontSize: "13px",
            }}
          >
            <p>
              Powered by <strong style={{ opacity: 0.8 }}>BenefitNest</strong>
            </p>
            <p style={{ marginTop: "8px" }}>
              <a
                href="#"
                style={{
                  color: textColor,
                  opacity: 0.7,
                  textDecoration: "none",
                }}
              >
                Privacy Policy
              </a>
              {" • "}
              <a
                href="#"
                style={{
                  color: textColor,
                  opacity: 0.7,
                  textDecoration: "none",
                }}
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
