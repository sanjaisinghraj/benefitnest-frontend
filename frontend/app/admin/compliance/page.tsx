"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://benefitnest-backend.onrender.com";

interface Tenant {
  tenant_id: string;
  corporate_legal_name: string;
  subdomain: string;
  country: string;
  compliance_policy_setting: "Default" | "Customized";
}

interface CompliancePolicy {
  privacy_policy_title: string;
  privacy_policy_content: string;
  terms_conditions_title: string;
  terms_conditions_content: string;
  disclaimer_title: string;
  disclaimer_content: string;
  consent_checkbox_text: string;
  consent_details_content: string;
  dpa_required: boolean;
  dpa_title: string;
  dpa_content: string;
}

type DocumentType = "privacy_policy" | "terms_conditions" | "disclaimer" | "consent" | "dpa";

const colors = {
  primary: "#2563eb",
  secondary: "#10b981",
  accent: "#f59e42",
  gray: {
    50: "#f8fafc",
    100: "#f3f4f6",
    200: "#e5e7eb",
    300: "#d1d5db",
    500: "#6b7280",
    600: "#4b5563",
    700: "#374151",
    800: "#1f2937",
    900: "#111827",
  },
};

export default function CompliancePage() {
  const router = useRouter();
  const [policies, setPolicies] = useState<CompliancePolicy | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [showProfileMenu, setShowProfileMenu] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [defaultPoliciesByCountry, setDefaultPoliciesByCountry] = useState<Record<string, CompliancePolicy>>({});
  const [availableCountries, setAvailableCountries] = useState<string[]>([]);
  const [activeDocument, setActiveDocument] = useState<DocumentType>("privacy_policy");
  const [editedContent, setEditedContent] = useState<string>("");
  const [hasChanges, setHasChanges] = useState<boolean>(false);
  const [editorInitialized, setEditorInitialized] = useState<boolean>(false);
  const editorRef = useRef<HTMLDivElement>(null);

  // Utility: getDocumentContent
  function getDocumentContent(policy: CompliancePolicy, docType: DocumentType): string {
    switch (docType) {
      case "privacy_policy":
        return policy.privacy_policy_content || "";
      case "terms_conditions":
        return policy.terms_conditions_content || "";
      case "disclaimer":
        return policy.disclaimer_content || "";
      case "consent":
        return policy.consent_details_content || "";
      case "dpa":
        return policy.dpa_content || "";
      default:
        return "";
    }
  }

  // Utility: handleSelectTenant
  async function handleSelectTenant(tenant: Tenant) {
    setSelectedTenant(tenant);
    setLoading(true);
    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch(
        `${API_URL}/api/admin/compliance-policies/${tenant.tenant_id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      if (data.success && data.policy) {
        setPolicies(data.policy);
        setEditedContent(getDocumentContent(data.policy, activeDocument));
      } else {
        // Initialize with empty policies if none exist
        const emptyPolicies: CompliancePolicy = {
          privacy_policy_title: "Privacy Policy",
          privacy_policy_content: "",
          terms_conditions_title: "Terms & Conditions",
          terms_conditions_content: "",
          disclaimer_title: "Disclaimer",
          disclaimer_content: "",
          consent_checkbox_text: "",
          consent_details_content: "",
          dpa_required: false,
          dpa_title: "Data Processing Agreement",
          dpa_content: "",
        };
        setPolicies(emptyPolicies);
        setEditedContent("");
      }
    } catch (error) {
      console.error("Failed to fetch policies:", error);
    } finally {
      setLoading(false);
    }
  }

  // Apply default compliance content from compliance_policy_settings_default table
  const handleApplyDefault = async () => {
    if (!selectedTenant) {
      alert("Please select a tenant first");
      return;
    }

    const tenantCountry = selectedTenant.country || "India";
    
    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch(
        `${API_URL}/api/admin/compliance-policies-default?country=${encodeURIComponent(tenantCountry)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      
      if (data.success && data.policy) {
        const defaultPolicy = data.policy;
        const updatedPolicies: CompliancePolicy = {
          privacy_policy_title: "Privacy Policy",
          privacy_policy_content: defaultPolicy.privacy_policy_content || "",
          terms_conditions_title: "Terms & Conditions",
          terms_conditions_content: defaultPolicy.terms_conditions_content || "",
          disclaimer_title: "Disclaimer",
          disclaimer_content: defaultPolicy.disclaimer_content || "",
          consent_checkbox_text: defaultPolicy.consent_checkbox_text || "",
          consent_details_content: defaultPolicy.consent_details_content || "",
          dpa_required: defaultPolicy.dpa_required || false,
          dpa_title: "Data Processing Agreement",
          dpa_content: defaultPolicy.dpa_content || "",
        };
        setPolicies(updatedPolicies);
        setEditedContent(getDocumentContent(updatedPolicies, activeDocument));
        setHasChanges(true);
        alert(`Default compliance content for ${tenantCountry} applied successfully! Click "Save Changes" to persist.`);
      } else {
        alert(`No default compliance content found for country: ${tenantCountry}`);
      }
    } catch (error) {
      console.error("Failed to fetch default policies:", error);
      alert("Failed to fetch default compliance content");
    }
  };

  // Utility: getDocumentTitle
  function getDocumentTitle(docType: DocumentType): string {
    switch (docType) {
      case "privacy_policy":
        return policies?.privacy_policy_title || "Privacy Policy";
      case "terms_conditions":
        return policies?.terms_conditions_title || "Terms & Conditions";
      case "disclaimer":
        return policies?.disclaimer_title || "Disclaimer";
      case "consent":
        return "Consent Form Text";
      case "dpa":
        return policies?.dpa_title || "Data Processing Agreement";
      default:
        return "";
    }
  }

  // Fetch tenants (corporates) on mount
  useEffect(() => {
    const fetchTenants = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("admin_token");
        const response = await fetch(`${API_URL}/api/admin/corporates`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        console.log("Corporates API response:", data);
        if (data.success && data.data) {
          setTenants(data.data);
        } else if (data.success && data.corporates) {
          setTenants(data.corporates);
        }
      } catch (error) {
        console.error("Failed to fetch tenants:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTenants();
  }, []);

  // TODO: Uncomment when backend endpoints are ready
  // useEffect(() => {
  //   // Fetch available countries from backend
  //   const fetchCountries = async () => {
  //     try {
  //       const token = localStorage.getItem("admin_token");
  //       const response = await fetch(`${API_URL}/api/admin/compliance-policies-default/countries`, {
  //         headers: { Authorization: `Bearer ${token}` },
  //       });
  //       const data = await response.json();
  //       if (data.success && data.countries) {
  //         setAvailableCountries(data.countries);
  //       }
  //     } catch (error) {
  //       setAvailableCountries(["India", "USA", "UK"]); // fallback
  //     }
  //   };
  //   fetchCountries();
  // }, []);

  // Use hardcoded countries for now until backend is ready
  useEffect(() => {
    setAvailableCountries(["India", "USA", "UK"]);
  }, []);

  const fetchDefaultPolicies = async (country: string) => {
    // TODO: Implement when backend endpoint is ready
    // For now, just set empty policy
    console.log("fetchDefaultPolicies called for:", country);
  };

  // Original implementation (commented out until backend is ready):
  // const fetchDefaultPolicies = async (country: string) => {
  //   try {
  //     const token = localStorage.getItem("admin_token");
  //     const response = await fetch(`${API_URL}/api/admin/compliance-policies-default?country=${country}`, {
  //       headers: { Authorization: `Bearer ${token}` },
  //     });
  //     const data = await response.json();
  //     if (data.success && data.policy) {
  //       setDefaultPoliciesByCountry((prev) => ({ ...prev, [country]: data.policy }));
  //     }
  //   } catch (error) {
  //     // handle error
  //   }
  // };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const country = e.target.value;
    setSelectedCountry(country);
    fetchDefaultPolicies(country);
  };

  const handleDocumentChange = (docType: DocumentType) => {
    if (hasChanges && !confirm("You have unsaved changes. Continue?")) return;
    setActiveDocument(docType);
    if (policies) {
      setEditedContent(getDocumentContent(policies, docType));
    }
    setHasChanges(false);
  };

  const handleContentChange = (newContent: string) => {
    setEditedContent(newContent);
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!selectedTenant || !policies) return;
    setSaving(true);
    try {
      const token = localStorage.getItem("admin_token");
      const updatedPolicies = { ...policies };

      switch (activeDocument) {
        case "privacy_policy":
          updatedPolicies.privacy_policy_content = editedContent;
          break;
        case "terms_conditions":
          updatedPolicies.terms_conditions_content = editedContent;
          break;
        case "disclaimer":
          updatedPolicies.disclaimer_content = editedContent;
          break;
        case "consent":
          updatedPolicies.consent_details_content = editedContent;
          break;
        case "dpa":
          updatedPolicies.dpa_content = editedContent;
          break;
      }

      const response = await fetch(
        `${API_URL}/api/admin/compliance-policies/${selectedTenant.tenant_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedPolicies),
        },
      );

      const data = await response.json();
      if (data.success) {
        setPolicies(updatedPolicies);
        setHasChanges(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        alert("Failed to save: " + (data.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Save error:", error);
      alert("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    document.cookie = "admin_token=; path=/; max-age=0";
    window.location.href = "https://www.benefitnest.space";
  };

  const filteredTenants = useMemo(() => {
    return tenants.filter(
      (t) =>
        t.corporate_legal_name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        t.subdomain.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [tenants, searchTerm]);

  const documentTabs: { type: DocumentType; label: string; icon: string }[] = [
    { type: "privacy_policy", label: "Privacy Policy", icon: "🔒" },
    { type: "terms_conditions", label: "Terms & Conditions", icon: "📜" },
    { type: "disclaimer", label: "Disclaimer", icon: "⚠️" },
    { type: "consent", label: "Consent Form", icon: "✅" },
    { type: "dpa", label: "DPA", icon: "📋" },
  ];

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f8fafc",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "50px",
              height: "50px",
              border: "4px solid #e5e7eb",
              borderTopColor: colors.primary,
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 16px",
            }}
          ></div>
          <p style={{ color: colors.gray[600] }}>
            Loading compliance settings...
          </p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f8fafc",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <header
        style={{
          backgroundColor: "white",
          borderBottom: "1px solid #e5e7eb",
          position: "sticky",
          top: 0,
          zIndex: 50,
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        <div
          style={{
            maxWidth: "1600px",
            margin: "0 auto",
            padding: "16px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <img
              src="/images/marketing/logo.png"
              alt="BenefitNest"
              style={{ height: "40px", objectFit: "contain" }}
            />
            <button
              onClick={() => router.push("/admin/dashboard")}
              style={{
                background: colors.gray[100],
                border: "none",
                color: colors.gray[700],
                padding: "10px 16px",
                borderRadius: "10px",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: "500",
              }}
            >
              ← Dashboard
            </button>
            <div
              style={{
                height: "24px",
                width: "1px",
                backgroundColor: colors.gray[200],
              }}
            ></div>
            <h1
              style={{
                fontSize: "18px",
                fontWeight: "700",
                color: colors.gray[900],
                margin: 0,
              }}
            >
              ⚖️ Compliance & Legal Settings
            </h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 12px",
                  backgroundColor: colors.gray[100],
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: colors.gray[700],
                }}
              >
                <span style={{ fontSize: "20px" }}>👤</span>
                <span>Admin</span>
                <span style={{ fontSize: "12px" }}>▼</span>
              </button>
              {showProfileMenu && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    right: 0,
                    marginTop: "8px",
                    backgroundColor: "white",
                    borderRadius: "8px",
                    boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
                    border: "1px solid #e5e7eb",
                    minWidth: "160px",
                    zIndex: 100,
                  }}
                >
                  <div style={{ padding: "8px" }}>
                    <button
                      onClick={() => router.push("/admin/dashboard")}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        textAlign: "left",
                        backgroundColor: "transparent",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "14px",
                        color: colors.gray[700],
                      }}
                    >
                      Dashboard
                    </button>
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={handleLogout}
              style={{
                padding: "10px 20px",
                backgroundColor: "#ef4444",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "600",
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main
        style={{
          flex: 1,
          display: "flex",
          maxWidth: "1600px",
          margin: "0 auto",
          width: "100%",
          padding: "24px",
          gap: "24px",
        }}
      >
        {/* Left Panel - Tenant List */}
        <div
          style={{
            width: "320px",
            flexShrink: 0,
            backgroundColor: "white",
            borderRadius: "12px",
            border: "1px solid #e5e7eb",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ padding: "20px", borderBottom: "1px solid #e5e7eb" }}>
            <h2
              style={{
                fontSize: "16px",
                fontWeight: "600",
                color: colors.gray[900],
                margin: "0 0 12px 0",
              }}
            >
              Select Organization
            </h2>
            <input
              type="text"
              placeholder="Search organizations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
            />
          </div>
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              maxHeight: "calc(100vh - 280px)",
            }}
          >
            {filteredTenants.map((tenant) => (
              <div
                key={tenant.tenant_id}
                onClick={() => handleSelectTenant(tenant)}
                style={{
                  padding: "16px 20px",
                  cursor: "pointer",
                  borderBottom: "1px solid #f3f4f6",
                  backgroundColor:
                    selectedTenant?.tenant_id === tenant.tenant_id
                      ? `${colors.primary}10`
                      : "white",
                  borderLeft:
                    selectedTenant?.tenant_id === tenant.tenant_id
                      ? `4px solid ${colors.primary}`
                      : "4px solid transparent",
                  transition: "all 0.2s",
                }}
              >
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: colors.gray[900],
                    marginBottom: "4px",
                  }}
                >
                  {tenant.corporate_legal_name}
                </div>
                <div style={{ fontSize: "12px", color: colors.gray[500] }}>
                  {tenant.subdomain}.benefitnest.space
                </div>
                <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                  <span
                    style={{
                      fontSize: "11px",
                      padding: "2px 8px",
                      borderRadius: "4px",
                      backgroundColor: colors.gray[100],
                      color: colors.gray[600],
                    }}
                  >
                    {tenant.country || "N/A"}
                  </span>
                  <span
                    style={{
                      fontSize: "11px",
                      padding: "2px 8px",
                      borderRadius: "4px",
                      backgroundColor:
                        tenant.compliance_policy_setting === "Customized"
                          ? "#dcfce7"
                          : "#fef3c7",
                      color:
                        tenant.compliance_policy_setting === "Customized"
                          ? "#166534"
                          : "#92400e",
                    }}
                  >
                    {tenant.compliance_policy_setting || "Default"}
                  </span>
                </div>
              </div>
            ))}
            {filteredTenants.length === 0 && (
              <div
                style={{
                  padding: "40px 20px",
                  textAlign: "center",
                  color: colors.gray[500],
                }}
              >
                No organizations found
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Document Editor */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          {!selectedTenant ? (
            <div
              style={{
                flex: 1,
                backgroundColor: "white",
                borderRadius: "12px",
                border: "1px solid #e5e7eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                padding: "60px",
              }}
            >
              <div style={{ fontSize: "64px", marginBottom: "20px" }}>⚖️</div>
              <h3
                style={{
                  fontSize: "20px",
                  fontWeight: "600",
                  color: colors.gray[900],
                  marginBottom: "8px",
                }}
              >
                Select an Organization
              </h3>
              <p
                style={{
                  fontSize: "14px",
                  color: colors.gray[500],
                  textAlign: "center",
                }}
              >
                Choose an organization from the list to view and edit their
                compliance documents
              </p>
            </div>
          ) : (
            <>
              {/* Tenant Header */}
              <div
                style={{
                  backgroundColor: "white",
                  borderRadius: "12px",
                  border: "1px solid #e5e7eb",
                  padding: "20px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <h2
                    style={{
                      fontSize: "18px",
                      fontWeight: "700",
                      color: colors.gray[900],
                      margin: "0 0 4px 0",
                    }}
                  >
                    {selectedTenant.corporate_legal_name}
                  </h2>
                  <p
                    style={{
                      fontSize: "13px",
                      color: colors.gray[500],
                      margin: 0,
                    }}
                  >
                    {selectedTenant.subdomain}.benefitnest.space •{" "}
                    {selectedTenant.country || "Country not set"}
                  </p>
                </div>
                <div
                  style={{ display: "flex", gap: "12px", alignItems: "center" }}
                >
                  {saveSuccess && (
                    <span
                      style={{
                        color: colors.secondary,
                        fontSize: "14px",
                        fontWeight: "500",
                      }}
                    >
                      ✓ Saved successfully!
                    </span>
                  )}
                  {hasChanges && (
                    <span style={{ color: colors.accent, fontSize: "13px" }}>
                      Unsaved changes
                    </span>
                  )}
                  <button
                    onClick={handleApplyDefault}
                    style={{
                      padding: "10px 24px",
                      backgroundColor: "white",
                      color: colors.primary,
                      border: `2px solid ${colors.primary}`,
                      borderRadius: "8px",
                      fontSize: "14px",
                      fontWeight: "600",
                      cursor: "pointer",
                    }}
                  >
                    Apply Default
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving || !hasChanges}
                    style={{
                      padding: "10px 24px",
                      backgroundColor: hasChanges
                        ? colors.primary
                        : colors.gray[300],
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "14px",
                      fontWeight: "600",
                      cursor: hasChanges ? "pointer" : "not-allowed",
                      opacity: saving ? 0.7 : 1,
                    }}
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>

              {/* Document Tabs */}
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {documentTabs.map((tab) => (
                  <button
                    key={tab.type}
                    onClick={() => handleDocumentChange(tab.type)}
                    style={{
                      padding: "12px 20px",
                      backgroundColor:
                        activeDocument === tab.type ? colors.primary : "white",
                      color:
                        activeDocument === tab.type
                          ? "white"
                          : colors.gray[700],
                      border: `1px solid ${activeDocument === tab.type ? colors.primary : colors.gray[200]}`,
                      borderRadius: "8px",
                      fontSize: "14px",
                      fontWeight: "500",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      transition: "all 0.2s",
                    }}
                  >
                    <span>{tab.icon}</span> {tab.label}
                  </button>
                ))}
              </div>

              {/* Editor */}
              <div
                style={{
                  flex: 1,
                  backgroundColor: "white",
                  borderRadius: "12px",
                  border: "1px solid #e5e7eb",
                  display: "flex",
                  flexDirection: "column",
                  minHeight: "500px",
                }}
              >
                <div
                  style={{
                    padding: "16px 20px",
                    borderBottom: "1px solid #e5e7eb",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "16px",
                      fontWeight: "600",
                      color: colors.gray[900],
                      margin: 0,
                    }}
                  >
                    {getDocumentTitle(activeDocument)}
                  </h3>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => document.execCommand("bold")}
                      style={{
                        padding: "6px 12px",
                        border: "1px solid #e5e7eb",
                        borderRadius: "6px",
                        backgroundColor: "white",
                        cursor: "pointer",
                        fontWeight: "bold",
                      }}
                    >
                      B
                    </button>
                    <button
                      onClick={() => document.execCommand("italic")}
                      style={{
                        padding: "6px 12px",
                        border: "1px solid #e5e7eb",
                        borderRadius: "6px",
                        backgroundColor: "white",
                        cursor: "pointer",
                        fontStyle: "italic",
                      }}
                    >
                      I
                    </button>
                    <button
                      onClick={() => document.execCommand("underline")}
                      style={{
                        padding: "6px 12px",
                        border: "1px solid #e5e7eb",
                        borderRadius: "6px",
                        backgroundColor: "white",
                        cursor: "pointer",
                        textDecoration: "underline",
                      }}
                    >
                      U
                    </button>
                    <button
                      onClick={() =>
                        document.execCommand("insertUnorderedList")
                      }
                      style={{
                        padding: "6px 12px",
                        border: "1px solid #e5e7eb",
                        borderRadius: "6px",
                        backgroundColor: "white",
                        cursor: "pointer",
                      }}
                    >
                      • List
                    </button>
                    <button
                      onClick={() => document.execCommand("insertOrderedList")}
                      style={{
                        padding: "6px 12px",
                        border: "1px solid #e5e7eb",
                        borderRadius: "6px",
                        backgroundColor: "white",
                        cursor: "pointer",
                      }}
                    >
                      1. List
                    </button>
                  </div>
                </div>
                <div
                  contentEditable
                  suppressContentEditableWarning
                  ref={editorRef}
                  onInput={(e) => handleContentChange(e.currentTarget.innerHTML)}
                  style={{
                    flex: 1,
                    padding: "24px",
                    fontSize: "15px",
                    lineHeight: "1.8",
                    color: colors.gray[800],
                    outline: "none",
                    overflowY: "auto",
                    minHeight: "400px",
                  }}
                  // Only set initial value
                  {...(editorInitialized ? {} : { dangerouslySetInnerHTML: { __html: editedContent } })}
                  onFocus={() => setEditorInitialized(true)}
                />
              </div>

              {/* Consent Checkbox Preview */}
              {activeDocument === "consent" && policies && (
                <div
                  style={{
                    backgroundColor: "#fffbeb",
                    borderRadius: "12px",
                    border: "1px solid #fcd34d",
                    padding: "20px",
                  }}
                >
                  <h4
                    style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#92400e",
                      margin: "0 0 12px 0",
                    }}
                  >
                    Preview: Login Page Consent Checkbox
                  </h4>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "12px",
                      cursor: "pointer",
                    }}
                  >
                    <input type="checkbox" style={{ marginTop: "4px" }} />
                    <span style={{ fontSize: "14px", color: colors.gray[700] }}>
                      {policies.consent_checkbox_text ||
                        "I agree to the Privacy Policy and Terms & Conditions"}
                    </span>
                  </label>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer
        style={{
          padding: "20px 24px",
          backgroundColor: "white",
          borderTop: "1px solid #e5e7eb",
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: "13px", color: colors.gray[500], margin: 0 }}>
          © {new Date().getFullYear()} BenefitNest. All rights reserved.
        </p>
      </footer>

      {showProfileMenu && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 40 }}
          onClick={() => setShowProfileMenu(false)}
        />
      )}
    </div>
  );
}
