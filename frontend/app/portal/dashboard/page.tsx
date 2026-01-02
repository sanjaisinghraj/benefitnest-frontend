"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import ChatWidget from "../../../components/ChatWidget";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://benefitnest-backend.onrender.com";

interface PortalConfig {
  tenant_id: string;
  company_name: string;
  subdomain: string;
  logo_url?: string;
  primary_color?: string;
  secondary_color?: string;
  contact_email?: string;
  contact_phone?: string;
  branding_config?: {
    primary_color?: string;
    secondary_color?: string;
    heading_font_family?: string;
    body_font_family?: string;
    logo_url?: string;
    portal_title?: string;
    portal_tagline?: string;
  };
}

interface User {
  id: string;
  name: string;
  email: string;
  full_name?: string;
}

export default function PortalDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [portalConfig, setPortalConfig] = useState<PortalConfig | null>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "features" | "contact"
  >("overview");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("portal_token");
    const savedUser = localStorage.getItem("portal_user");
    const savedTenant = localStorage.getItem("portal_tenant");

    if (!token || !savedUser || !savedTenant) {
      // Not logged in, redirect to login
      router.push("/portal");
      return;
    }

    try {
      setUser(JSON.parse(savedUser));
      setPortalConfig(JSON.parse(savedTenant));
    } catch {
      router.push("/portal");
      return;
    }

    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("portal_token");
    localStorage.removeItem("portal_user");
    localStorage.removeItem("portal_tenant");
    document.cookie = "portal_token=; path=/; max-age=0";
    router.push("/portal");
  };

  const theme = useMemo(() => {
    const branding = portalConfig?.branding_config || {};
    return {
      primary:
        portalConfig?.primary_color || branding.primary_color || "#2563eb",
      secondary:
        portalConfig?.secondary_color || branding.secondary_color || "#10b981",
      background: "#ffffff",
      text: "#111827",
      border: "#e5e7eb",
      headingFont: branding.heading_font_family || "Segoe UI",
      bodyFont: branding.body_font_family || "Segoe UI",
      headingWeight: 700,
      bodySize: 15,
      logoUrl: portalConfig?.logo_url || branding.logo_url,
      portalTitle:
        branding.portal_title ||
        portalConfig?.company_name ||
        "Benefits Portal",
    };
  }, [portalConfig]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-emerald-500 p-4">
        <div className="bg-white p-8 sm:p-12 md:p-16 rounded-2xl sm:rounded-3xl text-center shadow-2xl max-w-sm w-full">
          <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4 sm:mb-5" />
          <p className="text-gray-700 text-sm sm:text-base">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen p-3 sm:p-4 md:p-6"
      style={{
        background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`,
        fontFamily: theme.bodyFont,
      }}
    >
      <style>{`
        * { font-family: ${theme.bodyFont}, sans-serif; } 
        h1, h2, h3, h4, h5, h6 { font-family: ${theme.headingFont}, sans-serif; font-weight: ${theme.headingWeight}; } 
        .feature-card:hover { transform: translateY(-5px); box-shadow: 0 15px 40px rgba(0,0,0,0.1) !important; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="max-w-6xl mx-auto w-full">
        <div
          className="rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-10 shadow-2xl"
          style={{
            backgroundColor: theme.background,
            color: theme.text,
          }}
        >
          {/* Header */}
          <div
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8 md:mb-10 pb-4 sm:pb-6 md:pb-8"
            style={{ borderBottom: `1px solid ${theme.border}` }}
          >
            <div className="flex items-center gap-3 sm:gap-4 md:gap-5">
              <div
                className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-[75px] lg:h-[75px] rounded-xl sm:rounded-2xl flex items-center justify-center overflow-hidden flex-shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${theme.primary}15 0%, ${theme.secondary}15 100%)`,
                }}
              >
                {theme.logoUrl ? (
                  <img
                    src={theme.logoUrl}
                    alt={portalConfig?.company_name}
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <span className="text-2xl sm:text-3xl md:text-4xl">🏢</span>
                )}
              </div>
              <div>
                <h1
                  className="text-lg sm:text-xl md:text-2xl font-bold mb-1"
                  style={{
                    background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {theme.portalTitle}
                </h1>
                <p className="text-xs sm:text-sm opacity-55">
                  Welcome,{" "}
                  {user?.full_name || user?.name || user?.email?.split("@")[0]}!
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-red-50 text-red-800 rounded-lg sm:rounded-xl text-sm font-semibold hover:bg-red-100 transition-all"
            >
              Logout
            </button>
          </div>

          {/* Status Badge */}
          <div
            className="inline-block px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-xs sm:text-sm font-semibold mb-4 sm:mb-6"
            style={{
              background: "linear-gradient(135deg, #dcfce7 0%, #d1fae5 100%)",
              color: "#166534",
            }}
          >
            ✓ Portal Active
          </div>

          {/* Tab Navigation */}
          <div
            className="flex flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-8 md:mb-10 pb-4"
            style={{ borderBottom: `1px solid ${theme.border}` }}
          >
            {(["overview", "features", "contact"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-xs sm:text-sm font-semibold rounded-lg sm:rounded-t-xl transition-all flex-1 sm:flex-none min-w-0"
                style={{
                  background:
                    activeTab === tab
                      ? `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`
                      : "transparent",
                  color: activeTab === tab ? "white" : theme.text,
                  border: "none",
                  cursor: "pointer",
                  fontFamily: theme.headingFont,
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
                className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4"
                style={{
                  background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Welcome to Your Benefits Portal
              </h3>
              <p className="text-sm sm:text-base leading-relaxed opacity-75">
                This is your dedicated employee benefits portal for{" "}
                {portalConfig?.company_name}. Here you can manage your benefits,
                view policy details, and access important documents.
              </p>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5 mt-5 sm:mt-6 md:mt-8">
                <div
                  className="p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl text-center"
                  style={{ background: `${theme.primary}10` }}
                >
                  <div
                    className="text-2xl sm:text-3xl font-bold"
                    style={{ color: theme.primary }}
                  >
                    5
                  </div>
                  <div className="text-xs sm:text-sm opacity-60 mt-1 sm:mt-2">
                    Active Benefits
                  </div>
                </div>
                <div
                  className="p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl text-center"
                  style={{ background: `${theme.secondary}10` }}
                >
                  <div
                    className="text-2xl sm:text-3xl font-bold"
                    style={{ color: theme.secondary }}
                  >
                    12
                  </div>
                  <div className="text-xs sm:text-sm opacity-60 mt-1 sm:mt-2">
                    Documents
                  </div>
                </div>
                <div className="p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl text-center bg-amber-50/40 sm:col-span-2 lg:col-span-1">
                  <div className="text-2xl sm:text-3xl font-bold text-amber-500">
                    2
                  </div>
                  <div className="text-xs sm:text-sm opacity-60 mt-1 sm:mt-2">
                    Pending Actions
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "features" && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
              {[
                {
                  icon: "📋",
                  title: "View Benefits",
                  desc: "See all your benefits",
                },
                { icon: "📄", title: "Documents", desc: "Download documents" },
                { icon: "📊", title: "Claims", desc: "Track claims" },
                { icon: "👤", title: "Profile", desc: "Manage your info" },
                { icon: "🔔", title: "Alerts", desc: "Get notifications" },
                { icon: "💬", title: "Support", desc: "Contact support" },
              ].map((f, i) => (
                <div
                  key={i}
                  className="feature-card p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl text-center cursor-pointer transition-all"
                  style={{
                    border: `1px solid ${theme.border}`,
                    backgroundColor: theme.background,
                  }}
                >
                  <div className="text-2xl sm:text-3xl md:text-4xl mb-2 sm:mb-3">
                    {f.icon}
                  </div>
                  <div
                    className="text-xs sm:text-sm font-semibold mb-1"
                    style={{ color: theme.primary }}
                  >
                    {f.title}
                  </div>
                  <div className="text-xs opacity-55 hidden sm:block">
                    {f.desc}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "contact" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
              {portalConfig?.contact_email && (
                <div
                  className="p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl"
                  style={{
                    background: `linear-gradient(135deg, ${theme.primary}08 0%, ${theme.secondary}08 100%)`,
                  }}
                >
                  <div className="text-xs uppercase tracking-wide font-semibold opacity-50 mb-2">
                    EMAIL
                  </div>
                  <a
                    href={`mailto:${portalConfig.contact_email}`}
                    className="text-sm sm:text-base font-semibold no-underline break-all"
                    style={{ color: theme.primary }}
                  >
                    {portalConfig.contact_email}
                  </a>
                </div>
              )}
              {portalConfig?.contact_phone && (
                <div
                  className="p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl"
                  style={{
                    background: `linear-gradient(135deg, ${theme.secondary}08 0%, ${theme.primary}08 100%)`,
                  }}
                >
                  <div className="text-xs uppercase tracking-wide font-semibold opacity-50 mb-2">
                    PHONE
                  </div>
                  <a
                    href={`tel:${portalConfig.contact_phone}`}
                    className="text-sm sm:text-base font-semibold no-underline"
                    style={{ color: theme.secondary }}
                  >
                    {portalConfig.contact_phone}
                  </a>
                </div>
              )}
              <div className="p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-500/5 to-amber-500/10">
                <div className="text-xs uppercase tracking-wide font-semibold opacity-50 mb-2">
                  SUPPORT
                </div>
                <a
                  href="mailto:support@benefitnest.space"
                  className="text-sm sm:text-base font-semibold no-underline text-amber-500 break-all"
                >
                  support@benefitnest.space
                </a>
              </div>
            </div>
          )}

          {/* Footer */}
          <div
            className="mt-8 sm:mt-10 md:mt-12 pt-4 sm:pt-6 text-center text-xs sm:text-sm opacity-40"
            style={{ borderTop: `1px solid ${theme.border}` }}
          >
            <p>Powered by BenefitNest © {new Date().getFullYear()}</p>
          </div>
        </div>
      </div>
      
      {/* AI Chat Widget */}
      <ChatWidget
        userType="employee"
        userId={user?.id}
        userEmail={user?.email}
        userName={user?.full_name || user?.name}
        tenantId={portalConfig?.tenant_id}
        tenantCode={portalConfig?.subdomain}
        primaryColor={theme.primary}
      />
    </div>
  );
}
