"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const API_URL = "https://benefitnest-backend.onrender.com";

interface Corporate {
  tenant_id: string;
  corporate_legal_name: string;
  subdomain: string;
  status: string;
}

interface WellnessConfig {
  tenant_id: string;
  wellness_enabled: boolean;
  health_risk_assessment_enabled: boolean;
  mental_wellbeing_enabled: boolean;
  ai_wellness_coach_enabled: boolean;
  personalized_plans_enabled: boolean;
  knowledge_hub_enabled: boolean;
  preventive_care_enabled: boolean;
  financial_wellbeing_enabled: boolean;
  habit_tracking_enabled: boolean;
  journaling_enabled: boolean;
  ai_provider: string;
  ai_enabled: boolean;
  ai_guardrails_strict: boolean;
  require_consent: boolean;
  consent_text: string;
  anonymize_hr_reports: boolean;
  data_retention_days: number;
}

const defaultConfig: WellnessConfig = {
  tenant_id: "",
  wellness_enabled: false,
  health_risk_assessment_enabled: false,
  mental_wellbeing_enabled: false,
  ai_wellness_coach_enabled: false,
  personalized_plans_enabled: false,
  knowledge_hub_enabled: false,
  preventive_care_enabled: false,
  financial_wellbeing_enabled: false,
  habit_tracking_enabled: false,
  journaling_enabled: false,
  ai_provider: "openai",
  ai_enabled: true,
  ai_guardrails_strict: true,
  require_consent: true,
  consent_text:
    "I consent to participate in the Corporate Wellness Program. I understand that my wellness data will be used to provide personalized recommendations and aggregated (anonymized) reports to my employer.",
  anonymize_hr_reports: true,
  data_retention_days: 365,
};

const wellnessModules = [
  {
    key: "health_risk_assessment_enabled",
    name: "Health Risk Assessment (HRA)",
    description:
      "Comprehensive health questionnaire with rule-based scoring and optional AI insights",
    icon: "🏥",
    color: "bg-red-100 border-red-300",
    iconBg: "bg-red-500",
  },
  {
    key: "mental_wellbeing_enabled",
    name: "Mental Wellbeing Self-Assessment",
    description:
      "Mood tracking, stress surveys, burnout screening with evidence-based tools",
    icon: "🧠",
    color: "bg-purple-100 border-purple-300",
    iconBg: "bg-purple-500",
  },
  {
    key: "ai_wellness_coach_enabled",
    name: "AI Wellness Coach (Chat)",
    description:
      "Conversational AI coach for wellness guidance with strict guardrails",
    icon: "🤖",
    color: "bg-blue-100 border-blue-300",
    iconBg: "bg-blue-500",
  },
  {
    key: "personalized_plans_enabled",
    name: "Personalized Wellness Plans",
    description:
      "Goal-based wellness plans with daily tasks, milestones, and AI personalization",
    icon: "📋",
    color: "bg-green-100 border-green-300",
    iconBg: "bg-green-500",
  },
  {
    key: "knowledge_hub_enabled",
    name: "Knowledge & Articles Hub",
    description: "Curated wellness articles, tips, and educational content",
    icon: "📚",
    color: "bg-yellow-100 border-yellow-300",
    iconBg: "bg-yellow-500",
  },
  {
    key: "preventive_care_enabled",
    name: "Preventive Care Awareness",
    description:
      "Contextual reminders for checkups, vaccinations, and screenings",
    icon: "🩺",
    color: "bg-teal-100 border-teal-300",
    iconBg: "bg-teal-500",
  },
  {
    key: "financial_wellbeing_enabled",
    name: "Financial Wellbeing (Educational)",
    description:
      "Budget calculators, insurance literacy, and financial planning tools",
    icon: "💰",
    color: "bg-emerald-100 border-emerald-300",
    iconBg: "bg-emerald-500",
  },
  {
    key: "habit_tracking_enabled",
    name: "Habit Tracking & Challenges",
    description:
      "Daily habit logging, streaks, gamification, and team challenges",
    icon: "✅",
    color: "bg-orange-100 border-orange-300",
    iconBg: "bg-orange-500",
  },
  {
    key: "journaling_enabled",
    name: "Journaling & Reflection",
    description:
      "Private encrypted journal with mood tracking and optional AI sentiment",
    icon: "📔",
    color: "bg-pink-100 border-pink-300",
    iconBg: "bg-pink-500",
  },
];

export default function WellnessAdminPage() {
  const router = useRouter();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [corporates, setCorporates] = useState<Corporate[]>([]);
  const [selectedCorporates, setSelectedCorporates] = useState<string[]>([]);
  const [config, setConfig] = useState<WellnessConfig>(defaultConfig);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<"modules" | "ai" | "privacy">(
    "modules",
  );

  // Auth helper - same as CorporateManagement
  const getToken = () => {
    if (typeof window === "undefined") return null;
    return (
      document.cookie
        .split("; ")
        .find((row) => row.startsWith("admin_token="))
        ?.split("=")[1] || localStorage.getItem("admin_token")
    );
  };

  // Fetch corporates on mount
  useEffect(() => {
    fetchCorporates();
  }, []);

  // Fetch config when corporates selection changes (use first selected for preview)
  useEffect(() => {
    if (selectedCorporates.length === 1) {
      fetchWellnessConfig(selectedCorporates[0]);
    } else if (selectedCorporates.length > 1) {
      // Multiple selected - reset to default config for bulk update
      setConfig(defaultConfig);
    }
  }, [selectedCorporates]);

  const fetchCorporates = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const res = await fetch(`${API_URL}/api/admin/corporates`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const result = await res.json();
        // Backend returns { success: true, data: [...] } from tenants table
        if (result.success) {
          setCorporates(result.data || []);
        }
      } else {
        console.error("Failed to fetch corporates:", res.status);
      }
    } catch (error) {
      console.error("Error fetching corporates:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWellnessConfig = async (tenantId: string) => {
    try {
      setLoading(true);
      const token = getToken();
      const res = await fetch(`${API_URL}/api/wellness/config/${tenantId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setConfig(data.config || { ...defaultConfig, tenant_id: tenantId });
      } else {
        // No config exists yet
        setConfig({ ...defaultConfig, tenant_id: tenantId });
      }
    } catch (error) {
      console.error("Error fetching wellness config:", error);
      setConfig({ ...defaultConfig, tenant_id: tenantId });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (selectedCorporates.length === 0) {
      setMessage({
        type: "error",
        text: "Please select at least one corporate",
      });
      return (
        <div style={{ minHeight: "100vh", background: "#f9fafb", display: "flex", flexDirection: "column" }}>
          <AdminTopBar
            title="Wellness Programs"
            subtitle="Configure wellness partners, challenges, rewards, and analytics."
            icon={<span style={{ fontSize: 24 }}>💪</span>}
            showBack={true}
          />
          <main style={{ flex: 1, width: "100%", maxWidth: 1400, margin: "0 auto", padding: 24 }}>
            {/* ...existing content... */}
          </main>
          <AdminFooter />
        </div>
      );
      const results = await Promise.all(
        selectedCorporates.map(async (tenantId) => {
          const res = await fetch(`${API_URL}/api/wellness/config`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ ...config, tenant_id: tenantId }),
          });
          return { tenantId, success: res.ok };
        })
      );

      const successCount = results.filter((r) => r.success).length;
      const failCount = results.filter((r) => !r.success).length;

      if (failCount === 0) {
        setMessage({
          type: "success",
          text: `Wellness configuration saved for ${successCount} corporate(s)!`,
        });
      } else {
        setMessage({
          type: "error",
          text: `Saved ${successCount}, failed ${failCount} corporate(s)`,
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Failed to save wellness configuration",
      });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleToggleModule = (key: string) => {
    setConfig((prev) => ({
      ...prev,
      [key]: !prev[key as keyof WellnessConfig],
    }));
  };

  const handleEnableAll = () => {
    setConfig((prev) => ({
      ...prev,
      wellness_enabled: true,
      health_risk_assessment_enabled: true,
      mental_wellbeing_enabled: true,
      ai_wellness_coach_enabled: true,
      personalized_plans_enabled: true,
      knowledge_hub_enabled: true,
      preventive_care_enabled: true,
      financial_wellbeing_enabled: true,
      habit_tracking_enabled: true,
      journaling_enabled: true,
    }));
  };

  const handleDisableAll = () => {
    setConfig((prev) => ({
      ...prev,
      wellness_enabled: false,
      health_risk_assessment_enabled: false,
      mental_wellbeing_enabled: false,
      ai_wellness_coach_enabled: false,
      personalized_plans_enabled: false,
      knowledge_hub_enabled: false,
      preventive_care_enabled: false,
      financial_wellbeing_enabled: false,
      habit_tracking_enabled: false,
      journaling_enabled: false,
    }));
  };

  const enabledCount = wellnessModules.filter(
    (m) => config[m.key as keyof WellnessConfig],
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-cyan-50 flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src="/images/marketing/logo.png"
                alt="BenefitNest"
                className="h-10 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              <button
                onClick={() => router.push("/admin/dashboard")}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  🧘 Wellness Portal Configuration
                </h1>
                <p className="text-sm text-gray-600">
                  Configure wellness modules and AI settings per corporate
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* User Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium text-gray-700"
                >
                  <span className="text-xl">👤</span>
                  <span>Admin</span>
                  <span className="text-xs">▼</span>
                </button>
                {showProfileMenu && (
                  <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 min-w-[180px] z-50">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <div className="text-sm font-semibold text-gray-900">
                        Administrator
                      </div>
                      <div className="text-xs text-gray-500">
                        admin@benefitnest.com
                      </div>
                    </div>
                    <div className="p-2">
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          router.push("/admin/profile");
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 rounded-md flex items-center gap-2"
                      >
                        👤 My Profile
                      </button>
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          router.push("/admin/settings");
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 rounded-md flex items-center gap-2"
                      >
                        ⚙️ Settings
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={() => {
                  localStorage.removeItem("admin_token");
                  document.cookie = "admin_token=; path=/; max-age=0";
                  router.push("/admin");
                }}
                className="px-4 py-2 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-colors"
              >
                Logout
              </button>
              <button
                onClick={handleSave}
                disabled={saving || selectedCorporates.length === 0}
                className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-medium rounded-lg hover:from-teal-600 hover:to-cyan-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      ></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>Save Configuration</>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>
      {showProfileMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowProfileMenu(false)}
        />
      )}

      {/* Message Toast */}
      {message && (
        <div
          className={`fixed top-20 right-6 z-50 px-6 py-3 rounded-lg shadow-lg ${
            message.type === "success" ? "bg-green-500" : "bg-red-500"
          } text-white font-medium animate-fade-in`}
        >
          {message.text}
        </div>
      )}

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Corporate Selector - Multi Select */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Select Corporates ({selectedCorporates.length} selected)
            </label>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  setSelectedCorporates(corporates.map((c) => c.tenant_id))
                }
                className="px-3 py-1 text-xs font-medium text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-md transition-colors"
              >
                Select All
              </button>
              <button
                onClick={() => setSelectedCorporates([])}
                className="px-3 py-1 text-xs font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
          <div className="border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
            {corporates.map((corp) => (
              <label
                key={corp.tenant_id}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                  selectedCorporates.includes(corp.tenant_id)
                    ? "bg-teal-50"
                    : ""
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedCorporates.includes(corp.tenant_id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedCorporates((prev) => [
                        ...prev,
                        corp.tenant_id,
                      ]);
                    } else {
                      setSelectedCorporates((prev) =>
                        prev.filter((id) => id !== corp.tenant_id),
                      );
                    }
                  }}
                  className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                />
                <div className="flex-1">
                  <span className="font-medium text-gray-900">
                    {corp.corporate_legal_name || corp.subdomain}
                  </span>
                  <span className="ml-2 text-sm text-gray-500">
                    ({corp.subdomain})
                  </span>
                </div>
                <span
                  className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                    corp.status === "ACTIVE"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {corp.status}
                </span>
              </label>
            ))}
            {corporates.length === 0 && (
              <div className="px-4 py-8 text-center text-gray-500">
                {loading ? "Loading corporates..." : "No corporates found"}
              </div>
            )}
          </div>
          {selectedCorporates.length > 1 && (
            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-700">
                ⚠️ <strong>Bulk Update Mode:</strong> Changes will be applied to
                all {selectedCorporates.length} selected corporates.
              </p>
            </div>
          )}
        </div>

        {selectedCorporates.length > 0 && (
          <>
            {/* Master Toggle */}
            <div className="bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl shadow-lg p-6 mb-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <span className="text-2xl">✨</span>
                    Wellness Portal
                  </h2>
                  <p className="text-teal-100 mt-1">
                    Enable the wellness portal for this corporate
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      config.wellness_enabled ? "bg-white/20" : "bg-white/10"
                    }`}
                  >
                    {enabledCount} of {wellnessModules.length} modules enabled
                  </span>
                  <button
                    onClick={() =>
                      setConfig((prev) => ({
                        ...prev,
                        wellness_enabled: !prev.wellness_enabled,
                      }))
                    }
                    className={`relative w-14 h-7 rounded-full transition-colors ${
                      config.wellness_enabled ? "bg-white" : "bg-white/30"
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-5 h-5 rounded-full transition-all ${
                        config.wellness_enabled
                          ? "left-8 bg-teal-500"
                          : "left-1 bg-white"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
              {[
                { id: "modules", label: "Modules", icon: "📦" },
                { id: "ai", label: "AI Settings", icon: "🤖" },
                { id: "privacy", label: "Privacy & Consent", icon: "🔒" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() =>
                    setActiveTab(tab.id as "modules" | "ai" | "privacy")
                  }
                  className={`px-5 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
                    activeTab === tab.id
                      ? "bg-white shadow-md text-teal-600 border border-gray-200"
                      : "bg-white/50 text-gray-600 hover:bg-white/80"
                  }`}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Modules Tab */}
            {activeTab === "modules" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Wellness Modules
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={handleEnableAll}
                      className="px-4 py-2 text-sm bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200 transition-colors"
                    >
                      Enable All
                    </button>
                    <button
                      onClick={handleDisableAll}
                      className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Disable All
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {wellnessModules.map((module) => {
                    const isEnabled = config[
                      module.key as keyof WellnessConfig
                    ] as boolean;
                    return (
                      <div
                        key={module.key}
                        className={`relative bg-white rounded-xl border-2 p-5 transition-all cursor-pointer hover:shadow-md ${
                          isEnabled ? module.color : "border-gray-200"
                        }`}
                        onClick={() => handleToggleModule(module.key)}
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${
                              isEnabled
                                ? module.iconBg + " text-white"
                                : "bg-gray-100"
                            }`}
                          >
                            {module.icon}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">
                              {module.name}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {module.description}
                            </p>
                          </div>
                        </div>
                        <div
                          className={`absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                            isEnabled
                              ? "bg-teal-500 border-teal-500"
                              : "border-gray-300"
                          }`}
                        >
                          {isEnabled && (
                            <svg
                              className="w-4 h-4 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* AI Settings Tab */}
            {activeTab === "ai" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
                  <span className="text-xl">🤖</span>
                  AI Configuration
                </h3>

                <div className="space-y-6">
                  {/* AI Enabled Toggle */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        Enable AI Features
                      </h4>
                      <p className="text-sm text-gray-600">
                        Allow AI to assist with insights and recommendations
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        setConfig((prev) => ({
                          ...prev,
                          ai_enabled: !prev.ai_enabled,
                        }))
                      }
                      className={`relative w-14 h-7 rounded-full transition-colors ${
                        config.ai_enabled ? "bg-teal-500" : "bg-gray-300"
                      }`}
                    >
                      <div
                        className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${
                          config.ai_enabled ? "left-8" : "left-1"
                        }`}
                      />
                    </button>
                  </div>

                  {/* AI Provider */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      AI Provider
                    </label>
                    <select
                      value={config.ai_provider}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          ai_provider: e.target.value,
                        }))
                      }
                      className="w-full md:w-64 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      disabled={!config.ai_enabled}
                    >
                      <option value="openai">OpenAI (GPT-4)</option>
                      <option value="claude">Anthropic (Claude)</option>
                      <option value="gemini">Google (Gemini)</option>
                    </select>
                  </div>

                  {/* Strict Guardrails */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        Strict AI Guardrails
                      </h4>
                      <p className="text-sm text-gray-600">
                        Enforce conservative AI responses with medical/mental
                        health disclaimers
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        setConfig((prev) => ({
                          ...prev,
                          ai_guardrails_strict: !prev.ai_guardrails_strict,
                        }))
                      }
                      className={`relative w-14 h-7 rounded-full transition-colors ${
                        config.ai_guardrails_strict
                          ? "bg-teal-500"
                          : "bg-gray-300"
                      }`}
                      disabled={!config.ai_enabled}
                    >
                      <div
                        className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${
                          config.ai_guardrails_strict ? "left-8" : "left-1"
                        }`}
                      />
                    </button>
                  </div>

                  {/* AI Notice */}
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <svg
                        className="w-5 h-5 text-blue-600 mt-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <div>
                        <h4 className="font-medium text-blue-900">
                          AI Usage Policy
                        </h4>
                        <ul className="text-sm text-blue-800 mt-1 space-y-1">
                          <li>
                            • All AI interactions are logged in the
                            ai_audit_logs table
                          </li>
                          <li>
                            • Users can review, skip, or override AI suggestions
                          </li>
                          <li>• AI validates but never auto-saves records</li>
                          <li>• No user data is used for AI model training</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Privacy & Consent Tab */}
            {activeTab === "privacy" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
                  <span className="text-xl">🔒</span>
                  Privacy & Consent Settings
                </h3>

                <div className="space-y-6">
                  {/* Require Consent */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        Require User Consent
                      </h4>
                      <p className="text-sm text-gray-600">
                        Users must accept terms before accessing wellness
                        features
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        setConfig((prev) => ({
                          ...prev,
                          require_consent: !prev.require_consent,
                        }))
                      }
                      className={`relative w-14 h-7 rounded-full transition-colors ${
                        config.require_consent ? "bg-teal-500" : "bg-gray-300"
                      }`}
                    >
                      <div
                        className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${
                          config.require_consent ? "left-8" : "left-1"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Consent Text */}
                  {config.require_consent && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Consent Text
                      </label>
                      <textarea
                        value={config.consent_text}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            consent_text: e.target.value,
                          }))
                        }
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        placeholder="Enter the consent text users must accept..."
                      />
                    </div>
                  )}

                  {/* Anonymize HR Reports */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        Anonymize HR Reports
                      </h4>
                      <p className="text-sm text-gray-600">
                        HR dashboard shows only aggregate data, no individual
                        identifiers
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        setConfig((prev) => ({
                          ...prev,
                          anonymize_hr_reports: !prev.anonymize_hr_reports,
                        }))
                      }
                      className={`relative w-14 h-7 rounded-full transition-colors ${
                        config.anonymize_hr_reports
                          ? "bg-teal-500"
                          : "bg-gray-300"
                      }`}
                    >
                      <div
                        className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${
                          config.anonymize_hr_reports ? "left-8" : "left-1"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Data Retention */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data Retention Period
                    </label>
                    <select
                      value={config.data_retention_days}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          data_retention_days: parseInt(e.target.value),
                        }))
                      }
                      className="w-full md:w-64 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    >
                      <option value={90}>90 days</option>
                      <option value={180}>180 days</option>
                      <option value={365}>1 year</option>
                      <option value={730}>2 years</option>
                      <option value={1095}>3 years</option>
                    </select>
                    <p className="text-sm text-gray-500 mt-1">
                      Wellness data older than this will be automatically
                      deleted
                    </p>
                  </div>

                  {/* Privacy Notice */}
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <svg
                        className="w-5 h-5 text-green-600 mt-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                        />
                      </svg>
                      <div>
                        <h4 className="font-medium text-green-900">
                          Privacy Commitment
                        </h4>
                        <ul className="text-sm text-green-800 mt-1 space-y-1">
                          <li>• Journal entries are end-to-end encrypted</li>
                          <li>
                            • HR sees only aggregate metrics (minimum 10
                            employees per group)
                          </li>
                          <li>
                            • Individual responses are never shared with
                            employers
                          </li>
                          <li>
                            • Users can export or delete their data anytime
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {selectedCorporates.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-300">
            <div className="text-6xl mb-4">🏢</div>
            <h3 className="text-xl font-semibold text-gray-700">
              Select Corporates
            </h3>
            <p className="text-gray-500 mt-2">
              Choose one or more corporates from the list above to configure
              wellness settings
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto py-5 px-6 bg-white border-t border-gray-200 text-center">
        <p className="text-sm text-gray-500 mb-1">
          © {new Date().getFullYear()} BenefitNest. All rights reserved.
        </p>
        <p className="text-xs text-gray-400">Developed by Sanjai & Aaryam</p>
      </footer>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
