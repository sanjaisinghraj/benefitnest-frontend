"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import MarketplacePage from "../../components/marketplace/MarketplacePage";

const API_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "https://benefitnest-backend.onrender.com";

// Types
interface Corporate {
  tenant_id: string;
  corporate_legal_name: string;
  subdomain: string;
  primary_color?: string;
  secondary_color?: string;
  status?: string;
}

interface MarketplaceSettings {
  // Header Settings
  show_header: boolean;
  show_search_bar: boolean;
  show_wallet: boolean;
  show_cart: boolean;
  show_wishlist: boolean;
  show_notifications: boolean;

  // Hero/Banner Settings
  show_hero_banner: boolean;
  hero_headline: string;
  hero_subheadline: string;
  show_promotional_banners: boolean;

  // Categories Settings
  show_categories: boolean;
  categories_title: string;
  category_display_style: "grid" | "slider" | "list";

  // Products Settings
  show_featured_products: boolean;
  featured_products_title: string;
  show_deal_of_month: boolean;
  deal_countdown_enabled: boolean;
  show_new_arrivals: boolean;
  show_best_sellers: boolean;
  show_weekly_discounts: boolean;
  show_recently_viewed: boolean;
  products_per_row: number;

  // Vendors Settings
  show_vendors: boolean;
  vendors_title: string;

  // Wallet Settings
  initial_wallet_balance: number;
  wallet_currency: string;
  show_wallet_transactions: boolean;

  // Footer Settings
  show_footer: boolean;
  show_newsletter: boolean;

  // Styling
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  card_border_radius: number;

  // General
  marketplace_enabled: boolean;
  marketplace_title: string;
}

// Color constants
const colors = {
  primary: "#6366f1",
  primaryLight: "#e0e7ff",
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

// Default settings
const defaultSettings: MarketplaceSettings = {
  show_header: true,
  show_search_bar: true,
  show_wallet: true,
  show_cart: true,
  show_wishlist: true,
  show_notifications: true,
  show_hero_banner: true,
  hero_headline: "🎉 Special Employee Discounts!",
  hero_subheadline:
    "Use your benefits wallet to get exclusive deals on top brands",
  show_promotional_banners: true,
  show_categories: true,
  categories_title: "🏷️ Shop by Category",
  category_display_style: "grid",
  show_featured_products: true,
  featured_products_title: "⭐ Featured Products",
  show_deal_of_month: true,
  deal_countdown_enabled: true,
  show_new_arrivals: true,
  show_best_sellers: true,
  show_weekly_discounts: true,
  show_recently_viewed: true,
  products_per_row: 4,
  show_vendors: true,
  vendors_title: "🏪 Top Vendors",
  initial_wallet_balance: 5000,
  wallet_currency: "₹",
  show_wallet_transactions: true,
  show_footer: true,
  show_newsletter: true,
  primary_color: "#6366f1",
  secondary_color: "#8b5cf6",
  accent_color: "#f59e0b",
  background_color: "#f8fafc",
  card_border_radius: 16,
  marketplace_enabled: true,
  marketplace_title: "Employee Marketplace",
};

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
        padding: "6px 12px",
        borderRadius: "8px",
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
}: any) => {
  const variants: any = {
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
    ai: {
      bg: "linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7)",
      color: "white",
      border: "none",
    },
    magic: {
      bg: "linear-gradient(135deg, #f59e0b, #f97316)",
      color: "white",
      border: "none",
    },
  };
  const sizes: any = {
    xs: { padding: "6px 10px", fontSize: "11px" },
    sm: { padding: "8px 14px", fontSize: "12px" },
    md: { padding: "12px 20px", fontSize: "14px" },
    lg: { padding: "14px 24px", fontSize: "15px" },
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
        gap: "8px",
        background: v.bg,
        color: v.color,
        border: v.border,
        borderRadius: "10px",
        padding: s.padding,
        fontSize: s.fontSize,
        fontWeight: 600,
        cursor: disabled || loading ? "not-allowed" : "pointer",
        opacity: disabled || loading ? 0.6 : 1,
        transition: "all 0.2s",
        boxShadow:
          variant === "ai" || variant === "magic"
            ? "0 4px 15px rgba(99, 102, 241, 0.3)"
            : "none",
        ...customStyle,
      }}
    >
      {loading ? "⏳" : icon}
      {children}
    </button>
  );
};

const Toggle = ({
  label,
  value,
  onChange,
  description,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  description?: string;
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      padding: "14px 0",
      borderBottom: `1px solid ${colors.gray[100]}`,
    }}
  >
    <div style={{ flex: 1 }}>
      <div
        style={{ fontSize: "14px", fontWeight: 600, color: colors.gray[800] }}
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
    <button
      onClick={() => onChange(!value)}
      style={{
        width: "48px",
        height: "26px",
        borderRadius: "13px",
        backgroundColor: value ? colors.primary : colors.gray[300],
        border: "none",
        cursor: "pointer",
        position: "relative",
        transition: "all 0.2s",
      }}
    >
      <div
        style={{
          width: "20px",
          height: "20px",
          borderRadius: "50%",
          backgroundColor: "white",
          position: "absolute",
          top: "3px",
          left: value ? "25px" : "3px",
          transition: "all 0.2s",
          boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
        }}
      />
    </button>
  </div>
);

const Input = ({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  icon,
  hint,
}: any) => (
  <div style={{ marginBottom: "16px" }}>
    <label
      style={{
        display: "block",
        marginBottom: "6px",
        fontSize: "13px",
        fontWeight: 600,
        color: colors.gray[700],
      }}
    >
      {label}
    </label>
    <div style={{ position: "relative" }}>
      {icon && (
        <span
          style={{
            position: "absolute",
            left: "14px",
            top: "50%",
            transform: "translateY(-50%)",
            fontSize: "16px",
          }}
        >
          {icon}
        </span>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) =>
          onChange(
            type === "number"
              ? e.target.value === ""
                ? ""
                : Number(e.target.value)
              : e.target.value,
          )
        }
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: icon ? "12px 14px 12px 42px" : "12px 14px",
          border: `2px solid ${colors.gray[200]}`,
          borderRadius: "10px",
          fontSize: "14px",
          outline: "none",
          boxSizing: "border-box",
          transition: "border-color 0.2s",
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

const ColorPicker = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) => (
  <div style={{ marginBottom: "16px" }}>
    <label
      style={{
        display: "block",
        marginBottom: "6px",
        fontSize: "13px",
        fontWeight: 600,
        color: colors.gray[700],
      }}
    >
      {label}
    </label>
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      <input
        type="color"
        value={value || "#6366f1"}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "48px",
          height: "48px",
          border: `2px solid ${colors.gray[200]}`,
          borderRadius: "10px",
          cursor: "pointer",
          padding: "2px",
        }}
      />
      <input
        type="text"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="#6366f1"
        style={{
          flex: 1,
          padding: "12px 14px",
          border: `2px solid ${colors.gray[200]}`,
          borderRadius: "10px",
          fontSize: "14px",
          outline: "none",
          fontFamily: "monospace",
        }}
      />
    </div>
  </div>
);

const Select = ({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) => (
  <div style={{ marginBottom: "16px" }}>
    <label
      style={{
        display: "block",
        marginBottom: "6px",
        fontSize: "13px",
        fontWeight: 600,
        color: colors.gray[700],
      }}
    >
      {label}
    </label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: "100%",
        padding: "12px 14px",
        border: `2px solid ${colors.gray[200]}`,
        borderRadius: "10px",
        fontSize: "14px",
        outline: "none",
        backgroundColor: "white",
        cursor: "pointer",
      }}
    >
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
  icon,
  children,
  size = "md",
}: any) => {
  if (!isOpen) return null;
  const sizes: any = { sm: "400px", md: "600px", lg: "800px", xl: "95vw" };
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "20px",
          width: "100%",
          maxWidth: sizes[size],
          maxHeight: "90vh",
          overflow: "hidden",
          boxShadow: "0 25px 50px rgba(0,0,0,0.25)",
        }}
      >
        <div
          style={{
            padding: "20px 24px",
            borderBottom: `1px solid ${colors.gray[200]}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {icon && <span style={{ fontSize: "24px" }}>{icon}</span>}
            <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 700 }}>
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
              color: colors.gray[400],
            }}
          >
            ×
          </button>
        </div>
        <div
          style={{
            padding: "24px",
            overflowY: "auto",
            maxHeight: "calc(90vh - 80px)",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

// Main Component
export default function MarketplaceSettingsPage() {
  const router = useRouter();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [corporates, setCorporates] = useState<Corporate[]>([]);
  const [selectedCorporate, setSelectedCorporate] = useState<Corporate | null>(
    null,
  );
  const [settings, setSettings] =
    useState<MarketplaceSettings>(defaultSettings);
  const [originalSettings, setOriginalSettings] =
    useState<MarketplaceSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("general");
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const itemsPerPage = 5;
  const hasUnsavedChanges =
    JSON.stringify(settings) !== JSON.stringify(originalSettings);

  const getAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
  });

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Fetch corporates
  useEffect(() => {
    const fetchCorporates = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/admin/corporates`, {
          headers: getAuthHeaders(),
        });
        if (response.data.success) setCorporates(response.data.data || []);
      } catch (err) {
        console.error("Failed to fetch corporates:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCorporates();
  }, []);

  // Fetch marketplace settings for selected corporate
  const fetchMarketplaceSettings = useCallback(async (tenantId: string) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/admin/corporates/${tenantId}/marketplace-settings`,
        { headers: getAuthHeaders() },
      );
      if (response.data.success && response.data.data) {
        const merged = { ...defaultSettings, ...response.data.data };
        setSettings(merged);
        setOriginalSettings(merged);
      } else {
        setSettings(defaultSettings);
        setOriginalSettings(defaultSettings);
      }
    } catch (err) {
      console.log("No existing marketplace settings, using defaults");
      setSettings(defaultSettings);
      setOriginalSettings(defaultSettings);
    }
  }, []);

  const handleCorporateSelect = async (corp: Corporate) => {
    if (hasUnsavedChanges && !confirm("You have unsaved changes. Continue?"))
      return;
    if (!selectedCorporate) {
      showToast("No corporate selected.", "error");
      return;
    }
    try {
      await axios.put(
        `${API_URL}/api/admin/corporates/${selectedCorporate.tenant_id}/marketplace-settings`,
        settings,
        { headers: getAuthHeaders() },
      );
      setOriginalSettings(settings);
      showToast("Marketplace settings saved successfully!", "success");
    } catch (err) {
      showToast("Failed to save settings", "error");
    } finally {
      setSaving(false);
    }
  };

  // Save handler for marketplace settings
  // Save handler for marketplace settings
  const handleSave = async () => {
    if (!selectedCorporate) {
      showToast("No corporate selected.", "error");
      return;
    }
    setSaving(true);
    try {
      await axios.put(
        `${API_URL}/api/admin/corporates/${selectedCorporate.tenant_id}/marketplace-settings`,
        settings,
        { headers: getAuthHeaders() },
      );
      setOriginalSettings(settings);
      showToast("Marketplace settings saved successfully!", "success");
    } catch (err) {
      showToast("Failed to save settings", "error");
    } finally {
      setSaving(false);
    }
  };
  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    router.push("/admin");
  };

  const updateSetting = (key: keyof MarketplaceSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

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
    { id: "general", label: "General", icon: "⚙️" },
    { id: "header", label: "Header", icon: "📱" },
    { id: "sections", label: "Sections", icon: "📦" },
    { id: "products", label: "Products", icon: "🛍️" },
    { id: "wallet", label: "Wallet", icon: "💰" },
    { id: "styling", label: "Styling", icon: "🎨" },
  ];

  const theme = useMemo(
    () => ({
      primary: settings.primary_color || colors.primary,
      secondary: settings.secondary_color || colors.secondary,
      bodyFont: "Inter, sans-serif",
    }),
    [settings],
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f8fafc",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Toast */}
      {toast && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            zIndex: 9999,
            padding: "16px 24px",
            borderRadius: "12px",
            backgroundColor: toast.type === "success" ? "#dcfce7" : "#fee2e2",
            color: toast.type === "success" ? "#166534" : "#991b1b",
            boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "14px",
            fontWeight: 600,
          }}
        >
          {toast.type === "success" ? "✓" : "⚠️"} {toast.message}
        </div>
      )}

      {/* Header */}
      <header
        style={{
          background: "white",
          borderBottom: `1px solid ${colors.gray[200]}`,
          position: "sticky",
          top: 0,
          zIndex: 50,
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        <div
          style={{
            padding: "14px 24px",
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
              onError={(e: any) => {
                e.target.style.display = "none";
              }}
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
                height: "30px",
                width: "1px",
                backgroundColor: colors.gray[200],
              }}
            />
            <div>
              <h1
                style={{
                  fontSize: "22px",
                  fontWeight: "800",
                  margin: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  color: colors.gray[900],
                }}
              >
                <span style={{ fontSize: "28px" }}>🛍️</span> Marketplace
                Settings
              </h1>
              <p
                style={{
                  fontSize: "12px",
                  color: colors.gray[500],
                  margin: 0,
                  marginTop: "2px",
                }}
              >
                Configure employee marketplace for each corporate
              </p>
            </div>
          </div>
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
                Save Settings
              </Button>
            )}
            <div
              style={{
                height: "30px",
                width: "1px",
                backgroundColor: colors.gray[200],
              }}
            />
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
                    border: `1px solid ${colors.gray[200]}`,
                    minWidth: "180px",
                    zIndex: 200,
                  }}
                >
                  <div
                    style={{
                      padding: "12px 16px",
                      borderBottom: `1px solid ${colors.gray[200]}`,
                    }}
                  >
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: "600",
                        color: colors.gray[900],
                      }}
                    >
                      Administrator
                    </div>
                    <div style={{ fontSize: "12px", color: colors.gray[500] }}>
                      admin@benefitnest.com
                    </div>
                  </div>
                  <div style={{ padding: "8px" }}>
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        router.push("/admin/profile");
                      }}
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
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      👤 My Profile
                    </button>
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        router.push("/admin/settings");
                      }}
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
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      ⚙️ Settings
                    </button>
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={handleLogout}
              style={{
                background: "#ef4444",
                border: "none",
                color: "white",
                padding: "10px 18px",
                borderRadius: "10px",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: "600",
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      {showProfileMenu && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 40 }}
          onClick={() => setShowProfileMenu(false)}
        />
      )}

      {/* Main */}
      <main
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
                    onClick={() =>
                      window.open(
                        `https://${selectedCorporate.subdomain}.benefitnest.space/marketplace`,
                        "_blank",
                      )
                    }
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

          {/* Settings Controls */}
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
                {activeTab === "general" && (
                  <div>
                    <Toggle
                      label="Enable Marketplace"
                      value={settings.marketplace_enabled}
                      onChange={(v) => updateSetting("marketplace_enabled", v)}
                      description="Turn on/off marketplace for this corporate"
                    />
                    <div style={{ marginTop: "20px" }} />
                    <Input
                      label="Marketplace Title"
                      value={settings.marketplace_title}
                      onChange={(v: string) =>
                        updateSetting("marketplace_title", v)
                      }
                      placeholder="Employee Marketplace"
                      icon="🛍️"
                    />
                    <Input
                      label="Hero Headline"
                      value={settings.hero_headline}
                      onChange={(v: string) =>
                        updateSetting("hero_headline", v)
                      }
                      placeholder="🎉 Special Employee Discounts!"
                      icon="📢"
                    />
                    <Input
                      label="Hero Subheadline"
                      value={settings.hero_subheadline}
                      onChange={(v: string) =>
                        updateSetting("hero_subheadline", v)
                      }
                      placeholder="Use your benefits wallet to get exclusive deals"
                      icon="💬"
                    />
                    <Input
                      label="Categories Section Title"
                      value={settings.categories_title}
                      onChange={(v: string) =>
                        updateSetting("categories_title", v)
                      }
                      placeholder="🏷️ Shop by Category"
                      icon="🏷️"
                    />
                    <Input
                      label="Featured Products Title"
                      value={settings.featured_products_title}
                      onChange={(v: string) =>
                        updateSetting("featured_products_title", v)
                      }
                      placeholder="⭐ Featured Products"
                      icon="⭐"
                    />
                    <Input
                      label="Vendors Section Title"
                      value={settings.vendors_title}
                      onChange={(v: string) =>
                        updateSetting("vendors_title", v)
                      }
                      placeholder="🏪 Top Vendors"
                      icon="🏪"
                    />
                  </div>
                )}

                {activeTab === "header" && (
                  <div>
                    <Toggle
                      label="Show Header"
                      value={settings.show_header}
                      onChange={(v) => updateSetting("show_header", v)}
                      description="Main navigation header"
                    />
                    <Toggle
                      label="Show Search Bar"
                      value={settings.show_search_bar}
                      onChange={(v) => updateSetting("show_search_bar", v)}
                      description="Product search functionality"
                    />
                    <Toggle
                      label="Show Wallet"
                      value={settings.show_wallet}
                      onChange={(v) => updateSetting("show_wallet", v)}
                      description="Display wallet balance in header"
                    />
                    <Toggle
                      label="Show Cart"
                      value={settings.show_cart}
                      onChange={(v) => updateSetting("show_cart", v)}
                      description="Shopping cart icon"
                    />
                    <Toggle
                      label="Show Wishlist"
                      value={settings.show_wishlist}
                      onChange={(v) => updateSetting("show_wishlist", v)}
                      description="Wishlist heart icon"
                    />
                    <Toggle
                      label="Show Notifications"
                      value={settings.show_notifications}
                      onChange={(v) => updateSetting("show_notifications", v)}
                      description="Notification bell icon"
                    />
                  </div>
                )}

                {activeTab === "sections" && (
                  <div>
                    <h4
                      style={{
                        fontSize: "14px",
                        fontWeight: "600",
                        marginBottom: "16px",
                        color: colors.gray[700],
                      }}
                    >
                      🎯 Banner & Promotions
                    </h4>
                    <Toggle
                      label="Show Hero Banner"
                      value={settings.show_hero_banner}
                      onChange={(v) => updateSetting("show_hero_banner", v)}
                      description="Main promotional banner at top"
                    />
                    <Toggle
                      label="Show Promotional Banners"
                      value={settings.show_promotional_banners}
                      onChange={(v) =>
                        updateSetting("show_promotional_banners", v)
                      }
                      description="Free delivery, cashback info banners"
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
                      📦 Content Sections
                    </h4>
                    <Toggle
                      label="Show Categories"
                      value={settings.show_categories}
                      onChange={(v) => updateSetting("show_categories", v)}
                      description="Product category grid"
                    />
                    <Toggle
                      label="Show Vendors"
                      value={settings.show_vendors}
                      onChange={(v) => updateSetting("show_vendors", v)}
                      description="Top vendors section"
                    />
                    <Toggle
                      label="Show Newsletter"
                      value={settings.show_newsletter}
                      onChange={(v) => updateSetting("show_newsletter", v)}
                      description="Email subscription section"
                    />
                    <Toggle
                      label="Show Footer"
                      value={settings.show_footer}
                      onChange={(v) => updateSetting("show_footer", v)}
                      description="Footer with links and info"
                    />

                    <div style={{ marginTop: "20px" }} />
                    <Select
                      label="Category Display Style"
                      value={settings.category_display_style}
                      onChange={(v) =>
                        updateSetting("category_display_style", v)
                      }
                      options={[
                        { value: "grid", label: "Grid Layout" },
                        { value: "slider", label: "Horizontal Slider" },
                        { value: "list", label: "List View" },
                      ]}
                    />
                  </div>
                )}

                {activeTab === "products" && (
                  <div>
                    <Toggle
                      label="Show Featured Products"
                      value={settings.show_featured_products}
                      onChange={(v) =>
                        updateSetting("show_featured_products", v)
                      }
                      description="Main product showcase"
                    />
                    <Toggle
                      label="Show Deal of the Month"
                      value={settings.show_deal_of_month}
                      onChange={(v) => updateSetting("show_deal_of_month", v)}
                      description="Special deals with timer"
                    />
                    <Toggle
                      label="Deal Countdown Timer"
                      value={settings.deal_countdown_enabled}
                      onChange={(v) =>
                        updateSetting("deal_countdown_enabled", v)
                      }
                      description="Show countdown for deals"
                    />
                    <Toggle
                      label="Show New Arrivals"
                      value={settings.show_new_arrivals}
                      onChange={(v) => updateSetting("show_new_arrivals", v)}
                      description="Recently added products"
                    />
                    <Toggle
                      label="Show Best Sellers"
                      value={settings.show_best_sellers}
                      onChange={(v) => updateSetting("show_best_sellers", v)}
                      description="Top selling products"
                    />
                    <Toggle
                      label="Show Weekly Discounts"
                      value={settings.show_weekly_discounts}
                      onChange={(v) =>
                        updateSetting("show_weekly_discounts", v)
                      }
                      description="Weekly discount section"
                    />
                    <Toggle
                      label="Show Recently Viewed"
                      value={settings.show_recently_viewed}
                      onChange={(v) => updateSetting("show_recently_viewed", v)}
                      description="User's browsing history"
                    />

                    <div style={{ marginTop: "20px" }} />
                    <Input
                      label="Products Per Row"
                      type="number"
                      value={settings.products_per_row}
                      onChange={(v: number) =>
                        updateSetting("products_per_row", v)
                      }
                      hint="Number of products in each row (2-6)"
                    />
                  </div>
                )}

                {activeTab === "wallet" && (
                  <div>
                    <div
                      style={{
                        padding: "20px",
                        backgroundColor: `${colors.primary}10`,
                        borderRadius: "14px",
                        marginBottom: "20px",
                        border: `1px solid ${colors.primary}20`,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          marginBottom: "12px",
                        }}
                      >
                        <span style={{ fontSize: "32px" }}>💰</span>
                        <div>
                          <div
                            style={{
                              fontSize: "16px",
                              fontWeight: "700",
                              color: colors.gray[900],
                            }}
                          >
                            Employee Wallet
                          </div>
                          <div
                            style={{
                              fontSize: "12px",
                              color: colors.gray[600],
                            }}
                          >
                            Configure wallet settings for employees
                          </div>
                        </div>
                      </div>
                    </div>

                    <Input
                      label="Initial Wallet Balance"
                      type="number"
                      value={settings.initial_wallet_balance}
                      onChange={(v: number) =>
                        updateSetting("initial_wallet_balance", v)
                      }
                      icon="💵"
                      hint="Starting balance for new employees"
                    />
                    <Input
                      label="Currency Symbol"
                      value={settings.wallet_currency}
                      onChange={(v: string) =>
                        updateSetting("wallet_currency", v)
                      }
                      placeholder="₹"
                      hint="e.g., ₹, $, €, £"
                    />
                    <Toggle
                      label="Show Wallet Transactions"
                      value={settings.show_wallet_transactions}
                      onChange={(v) =>
                        updateSetting("show_wallet_transactions", v)
                      }
                      description="Allow employees to view transaction history"
                    />
                  </div>
                )}

                {activeTab === "styling" && (
                  <div>
                    <ColorPicker
                      label="Primary Color"
                      value={settings.primary_color}
                      onChange={(v) => updateSetting("primary_color", v)}
                    />
                    <ColorPicker
                      label="Secondary Color"
                      value={settings.secondary_color}
                      onChange={(v) => updateSetting("secondary_color", v)}
                    />
                    <ColorPicker
                      label="Accent Color"
                      value={settings.accent_color}
                      onChange={(v) => updateSetting("accent_color", v)}
                    />
                    <ColorPicker
                      label="Background Color"
                      value={settings.background_color}
                      onChange={(v) => updateSetting("background_color", v)}
                    />
                    <Input
                      label="Card Border Radius (px)"
                      type="number"
                      value={settings.card_border_radius}
                      onChange={(v: number) =>
                        updateSetting("card_border_radius", v)
                      }
                      hint="Roundness of cards (0-30)"
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
              <div style={{ fontSize: "72px", marginBottom: "20px" }}>🛍️</div>
              <h2
                style={{
                  fontSize: "28px",
                  fontWeight: "800",
                  color: colors.gray[900],
                  marginBottom: "12px",
                }}
              >
                Marketplace Settings
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
                Configure the employee marketplace for each corporate. Set up
                categories, products, wallet settings, and customize the look
                and feel.
              </p>
              <div
                style={{
                  display: "flex",
                  gap: "16px",
                  justifyContent: "center",
                  flexWrap: "wrap",
                }}
              >
                <Badge variant="primary">💰 Wallet System</Badge>
                <Badge variant="success">🛒 Shopping Cart</Badge>
                <Badge variant="warning">🏷️ Categories</Badge>
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
                      🔒 {selectedCorporate.subdomain}
                      .benefitnest.space/marketplace
                    </span>
                  </div>
                </div>
                <div style={{ height: "calc(100% - 34px)", overflow: "auto" }}>
                  <MarketplacePage
                    settings={settings}
                    theme={theme}
                    companyName={selectedCorporate.corporate_legal_name}
                    isPreview={true}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Preview Modal */}
      <Modal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        title="Marketplace Preview"
        icon="🛍️"
        size="xl"
      >
        <div
          style={{
            height: "70vh",
            borderRadius: "12px",
            overflow: "hidden",
            border: `1px solid ${colors.gray[200]}`,
          }}
        >
          <MarketplacePage
            settings={settings}
            theme={theme}
            companyName={selectedCorporate?.corporate_legal_name || "Company"}
            isPreview={false}
          />
        </div>
        <div
          style={{
            marginTop: "20px",
            display: "flex",
            gap: "12px",
            justifyContent: "flex-end",
          }}
        >
          <Button variant="outline" onClick={() => setShowPreviewModal(false)}>
            Close
          </Button>
          <Button
            variant="primary"
            onClick={() =>
              window.open(
                `https://${selectedCorporate?.subdomain}.benefitnest.space/marketplace`,
                "_blank",
              )
            }
          >
            🔗 Open Live Marketplace
          </Button>
        </div>
      </Modal>
    </div>
  );
}
