"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import AdminTopBar from "../components/AdminTopBar";
import AdminFooter from "../components/AdminFooter";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://benefitnest-backend.onrender.com";

// Color palette
const colors = {
  primary: "#6366f1",
  primaryHover: "#4f46e5",
  primaryLight: "#e0e7ff",
  secondary: "#8b5cf6",
  success: "#10b981",
  successLight: "#d1fae5",
  danger: "#ef4444",
  dangerLight: "#fee2e2",
  warning: "#f59e0b",
  warningLight: "#fef3c7",
  info: "#0891b2",
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

// Chart colors for different datasets
const chartColors = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#ef4444",
  "#f59e0b",
  "#10b981",
  "#06b6d4",
  "#3b82f6",
  "#14b8a6",
  "#f97316",
];

interface Corporate {
  tenant_id: string;
  corporate_legal_name: string;
  subdomain: string;
}

interface ChartData {
  labels: string[];
  values: number[];
  colors?: string[];
}

interface ClaimsAnalytics {
  totalClaims: number;
  totalClaimedAmount: number;
  totalApprovedAmount: number;
  totalRejected: number;
  avgSettlementDays: number;
  claimsByStatus: ChartData;
  claimsByType: ChartData;
  monthlyTrends: ChartData;
  topHospitals: ChartData;
  claimsByCategory: ChartData;
}

// ============= SVG CHART COMPONENTS =============

// Donut Chart Component
const DonutChart = ({
  data,
        <svg
          viewBox="0 0 200 200"
        >
          {/* ...existing svg content... */}
        </svg>
        {/* ...existing code... */}
    const angle = (percentage / 100) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = center + radius * Math.cos(startRad);
    const y1 = center + radius * Math.sin(startRad);
    const x2 = center + radius * Math.cos(endRad);
    const y2 = center + radius * Math.sin(endRad);

    const largeArc = angle > 180 ? 1 : 0;

    return {
      path: `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
      color: data.colors?.[index] || chartColors[index % chartColors.length],
      label: data.labels[index],
      value,
      percentage: percentage.toFixed(1),
    };
  });

  return (
    <div
      style={{
        backgroundColor: "white",
        borderRadius: "16px",
        padding: "20px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        border: `1px solid ${colors.gray[100]}`,
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <h3
          style={{
            fontSize: "16px",
            fontWeight: "700",
            color: colors.gray[800],
            margin: 0,
          }}
        >
          {title}
        </h3>
        <button
          onClick={onInsightClick}
          disabled={loadingInsight}
          style={{
            padding: "6px 12px",
            background: loadingInsight
              ? colors.gray[200]
              : `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
            color: loadingInsight ? colors.gray[500] : "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "11px",
            fontWeight: "600",
            cursor: loadingInsight ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          {loadingInsight ? "⏳ Analyzing..." : "✨ Insights"}
        </button>
      </div>

      <div
        style={{ display: "flex", alignItems: "center", gap: "20px", flex: 1 }}
      >
        <svg
          viewBox="0 0 200 200"
          return (
            <div style={{ minHeight: "100vh", backgroundColor: colors.gray[50] }}>
              <AdminTopBar
                title="Reports & Analytics"
                subtitle="Claims Intelligence Dashboard"
                icon={<span style={{ fontSize: 24 }}>📊</span>}
                showBack={true}
              />

              <main style={{ maxWidth: 1400, margin: "0 auto", padding: 32 }}>
            margin: 0,
          }}
        >
          {title}
        </h3>
        <button
          onClick={onInsightClick}
          disabled={loadingInsight}
          style={{
            padding: "6px 12px",
            background: loadingInsight
              ? colors.gray[200]
              : `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
            color: loadingInsight ? colors.gray[500] : "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "11px",
            fontWeight: "600",
            cursor: loadingInsight ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          {loadingInsight ? "⏳ Analyzing..." : "✨ Insights"}
        </button>
      </div>

      {horizontal ? (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          {data.labels.slice(0, 6).map((label, i) => (
            <div
              key={i}
              style={{ display: "flex", alignItems: "center", gap: "10px" }}
            >
              <span
                style={{
                  fontSize: "11px",
                  color: colors.gray[600],
                  width: "100px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {label}
              </span>
              <div
                style={{
                  flex: 1,
                  height: "24px",
                  backgroundColor: colors.gray[100],
                  borderRadius: "6px",
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    width: `${(data.values[i] / maxValue) * 100}%`,
                    height: "100%",
                    background: `linear-gradient(90deg, ${chartColors[i % chartColors.length]}, ${chartColors[(i + 1) % chartColors.length]}40)`,
                    borderRadius: "6px",
                    transition: "width 0.5s ease",
                  }}
                />
                <span
                  style={{
                    position: "absolute",
                    right: "8px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: "10px",
                    fontWeight: "600",
                    color: colors.gray[700],
                  }}
                >
                  {data.values[i].toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "flex-end",
            gap: "8px",
            paddingTop: "10px",
          }}
        >
          {data.labels.map((label, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: "600",
                  color: colors.gray[700],
                }}
              >
                {data.values[i].toLocaleString()}
              </span>
              <div
                style={{
                  width: "100%",
                  height: `${Math.max((data.values[i] / maxValue) * 150, 10)}px`,
                  background: `linear-gradient(180deg, ${chartColors[i % chartColors.length]}, ${chartColors[i % chartColors.length]}80)`,
                  borderRadius: "6px 6px 0 0",
                  transition: "height 0.5s ease",
                }}
              />
              <span
                style={{
                  fontSize: "9px",
                  color: colors.gray[500],
                  textAlign: "center",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: "100%",
                }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      )}

      {insight && (
        <div
          style={{
            marginTop: "12px",
            padding: "12px",
            backgroundColor: `${colors.primary}08`,
            borderRadius: "10px",
            border: `1px solid ${colors.primary}20`,
          }}
        >
          <div
            style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}
          >
            <span style={{ fontSize: "16px" }}>🤖</span>
            <p
              style={{
                fontSize: "12px",
                color: colors.gray[700],
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              {insight}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// Line/Area Chart Component
const AreaChart = ({
  data,
  title,
  onInsightClick,
  insight,
  loadingInsight,
}: {
  data: ChartData;
  title: string;
  onInsightClick: () => void;
  insight?: string;
  loadingInsight?: boolean;
}) => {
  const maxValue = Math.max(...data.values, 1);
  const width = 400;
  const height = 180;
  const padding = { top: 20, right: 20, bottom: 30, left: 50 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const points = data.values.map((value, i) => ({
    x: padding.left + (i / (data.values.length - 1 || 1)) * chartWidth,
    y: padding.top + chartHeight - (value / maxValue) * chartHeight,
  }));

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1]?.x || padding.left} ${padding.top + chartHeight} L ${padding.left} ${padding.top + chartHeight} Z`;

  return (
    <div
      style={{
        backgroundColor: "white",
        borderRadius: "16px",
        padding: "20px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        border: `1px solid ${colors.gray[100]}`,
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <h3
          style={{
            fontSize: "16px",
            fontWeight: "700",
            color: colors.gray[800],
            margin: 0,
          }}
        >
          {title}
        </h3>
        <button
          onClick={onInsightClick}
          disabled={loadingInsight}
          style={{
            padding: "6px 12px",
            background: loadingInsight
              ? colors.gray[200]
              : `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
            color: loadingInsight ? colors.gray[500] : "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "11px",
            fontWeight: "600",
            cursor: loadingInsight ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          {loadingInsight ? "⏳ Analyzing..." : "✨ Insights"}
        </button>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: "100%", height: "auto", minHeight: "180px" }}
      >
        {/* Grid lines */}
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i}>
            <line
              x1={padding.left}
              y1={padding.top + (chartHeight / 4) * i}
              x2={width - padding.right}
              y2={padding.top + (chartHeight / 4) * i}
              stroke={colors.gray[200]}
              strokeDasharray="4,4"
            />
            <text
              x={padding.left - 8}
              y={padding.top + (chartHeight / 4) * i + 4}
              textAnchor="end"
              style={{ fontSize: "9px", fill: colors.gray[500] }}
            >
              {Math.round(maxValue - (maxValue / 4) * i).toLocaleString()}
            </text>
          </g>
        ))}

        {/* Gradient */}
        <defs>
          <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={colors.primary} stopOpacity="0.3" />
            <stop offset="100%" stopColor={colors.primary} stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {/* Area */}
        <path d={areaPath} fill="url(#areaGradient)" />

        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke={colors.primary}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Points */}
        {points.map((p, i) => (
          <g key={i}>
            <circle
              cx={p.x}
              cy={p.y}
              r="5"
              fill="white"
              stroke={colors.primary}
              strokeWidth="2"
            />
            <text
              x={p.x}
              y={height - 8}
              textAnchor="middle"
              style={{ fontSize: "8px", fill: colors.gray[500] }}
            >
              {data.labels[i]}
            </text>
          </g>
        ))}
      </svg>

      {insight && (
        <div
          style={{
            marginTop: "12px",
            padding: "12px",
            backgroundColor: `${colors.primary}08`,
            borderRadius: "10px",
            border: `1px solid ${colors.primary}20`,
          }}
        >
          <div
            style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}
          >
            <span style={{ fontSize: "16px" }}>🤖</span>
            <p
              style={{
                fontSize: "12px",
                color: colors.gray[700],
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              {insight}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// Multi-select Dropdown Component
const MultiSelectDropdown = ({
  options,
  selected,
  onChange,
  placeholder,
}: {
  options: Corporate[];
  selected: string[];
  onChange: (ids: string[]) => void;
  placeholder: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = options.filter((opt) =>
    opt.corporate_legal_name.toLowerCase().includes(search.toLowerCase()),
  );

  const toggleOption = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  const selectAll = () => {
    onChange(options.map((o) => o.tenant_id));
  };

  const clearAll = () => {
    onChange([]);
  };

  return (
    <div
      ref={dropdownRef}
      style={{ position: "relative", width: "100%", maxWidth: "500px" }}
    >
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: "12px 16px",
          border: `2px solid ${isOpen ? colors.primary : colors.gray[200]}`,
          borderRadius: "12px",
          backgroundColor: "white",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          minHeight: "48px",
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", flex: 1 }}>
          {selected.length === 0 ? (
            <span style={{ color: colors.gray[400], fontSize: "14px" }}>
              {placeholder}
            </span>
          ) : selected.length === options.length ? (
            <span
              style={{
                padding: "4px 10px",
                backgroundColor: colors.primaryLight,
                color: colors.primary,
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: "600",
              }}
            >
              All Corporates Selected
            </span>
          ) : (
            selected.slice(0, 3).map((id) => {
              const corp = options.find((o) => o.tenant_id === id);
              return (
                <span
                  key={id}
                  style={{
                    padding: "4px 10px",
                    backgroundColor: colors.primaryLight,
                    color: colors.primary,
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: "500",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  {corp?.corporate_legal_name.slice(0, 15)}...
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleOption(id);
                    }}
                    style={{ cursor: "pointer", marginLeft: "2px" }}
                  >
                    ×
                  </span>
                </span>
              );
            })
          )}
          {selected.length > 3 && (
            <span
              style={{
                padding: "4px 8px",
                backgroundColor: colors.gray[100],
                color: colors.gray[600],
                borderRadius: "6px",
                fontSize: "12px",
              }}
            >
              +{selected.length - 3} more
            </span>
          )}
        </div>
        <span
          style={{
            color: colors.gray[400],
            transform: isOpen ? "rotate(180deg)" : "none",
            transition: "0.2s",
          }}
        >
          ▼
        </span>
      </div>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            backgroundColor: "white",
            border: `1px solid ${colors.gray[200]}`,
            borderRadius: "12px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
            zIndex: 100,
            maxHeight: "350px",
            overflow: "hidden",
          }}
        >
          {/* Search */}
          <div
            style={{
              padding: "12px",
              borderBottom: `1px solid ${colors.gray[100]}`,
            }}
          >
            <input
              type="text"
              placeholder="🔍 Search corporates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: `1px solid ${colors.gray[200]}`,
                borderRadius: "8px",
                fontSize: "14px",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Quick Actions */}
          <div
            style={{
              padding: "8px 12px",
              display: "flex",
              gap: "8px",
              borderBottom: `1px solid ${colors.gray[100]}`,
            }}
          >
            <button
              onClick={selectAll}
              style={{
                padding: "6px 12px",
                backgroundColor: colors.primaryLight,
                color: colors.primary,
                border: "none",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Select All
            </button>
            <button
              onClick={clearAll}
              style={{
                padding: "6px 12px",
                backgroundColor: colors.gray[100],
                color: colors.gray[600],
                border: "none",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Clear All
            </button>
          </div>

          {/* Options */}
          <div style={{ maxHeight: "220px", overflowY: "auto" }}>
            {filtered.length === 0 ? (
              <div
                style={{
                  padding: "20px",
                  textAlign: "center",
                  color: colors.gray[500],
                  fontSize: "14px",
                }}
              >
                No corporates found
              </div>
            ) : (
              filtered.map((corp) => (
                <div
                  key={corp.tenant_id}
                  onClick={() => toggleOption(corp.tenant_id)}
                  style={{
                    padding: "12px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    cursor: "pointer",
                    backgroundColor: selected.includes(corp.tenant_id)
                      ? colors.primaryLight
                      : "white",
                    borderBottom: `1px solid ${colors.gray[50]}`,
                  }}
                >
                  <div
                    style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "4px",
                      border: `2px solid ${selected.includes(corp.tenant_id) ? colors.primary : colors.gray[300]}`,
                      backgroundColor: selected.includes(corp.tenant_id)
                        ? colors.primary
                        : "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontSize: "12px",
                      flexShrink: 0,
                    }}
                  >
                    {selected.includes(corp.tenant_id) && "✓"}
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: "500",
                        color: colors.gray[800],
                      }}
                    >
                      {corp.corporate_legal_name}
                    </div>
                    <div style={{ fontSize: "11px", color: colors.gray[500] }}>
                      {corp.subdomain}.benefitnest.space
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ============= MAIN COMPONENT =============

export default function ReportsAnalyticsPage() {
  const router = useRouter();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [adminProfile, setAdminProfile] = useState<{
    name: string;
    email: string;
    role: string;
  } | null>(null);

  // Data states
  const [corporates, setCorporates] = useState<Corporate[]>([]);
  const [selectedCorporates, setSelectedCorporates] = useState<string[]>([]);
  const [analytics, setAnalytics] = useState<ClaimsAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // AI Insights states
  const [chartInsights, setChartInsights] = useState<Record<string, string>>(
    {},
  );
  const [loadingInsights, setLoadingInsights] = useState<
    Record<string, boolean>
  >({});
  const [overallInsight, setOverallInsight] = useState("");
  const [loadingOverallInsight, setLoadingOverallInsight] = useState(false);

  const getToken = () => localStorage.getItem("admin_token");
  const getAuthHeaders = () => ({ Authorization: `Bearer ${getToken()}` });

  // Load admin profile
  useEffect(() => {
    const token = getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setAdminProfile({
          name: payload.name || payload.username || "Administrator",
          email: payload.email || "admin@benefitnest.space",
          role: payload.role || "Super Admin",
        });
      } catch {
        setAdminProfile({
          name: "Administrator",
          email: "admin@benefitnest.space",
          role: "Super Admin",
        });
      }
    }
  }, []);

  // Load corporates
  useEffect(() => {
    const loadCorporates = async () => {
      try {
        const res = await fetch(`${API_URL}/api/admin/corporates`, {
          headers: getAuthHeaders(),
        });
        const data = await res.json();
        if (data.success) {
          setCorporates(data.data || []);
        }
      } catch (err) {
        console.error("Failed to load corporates:", err);
      }
    };
    loadCorporates();
  }, []);

  // Load analytics when corporates are selected
  const loadAnalytics = useCallback(async () => {
    if (selectedCorporates.length === 0) {
      setAnalytics(null);
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/analytics`, {
        method: "POST",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ tenantIds: selectedCorporates }),
      });
      const data = await res.json();
      if (data.success) {
        setAnalytics(data.data);
        // Reset insights when data changes
        setChartInsights({});
        setOverallInsight("");
      } else {
        setError(data.message || "Failed to load analytics");
      }
    } catch (err) {
      setError("Failed to load analytics. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedCorporates]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  // Get AI insight for a specific chart
  const getChartInsight = async (
    chartType: string,
    chartData: ChartData,
    chartTitle: string,
  ) => {
    setLoadingInsights((prev) => ({ ...prev, [chartType]: true }));
    try {
      const res = await fetch(`${API_URL}/api/admin/claims-analytics/insight`, {
        method: "POST",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({
          chartType,
          chartData,
          chartTitle,
          tenantIds: selectedCorporates,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setChartInsights((prev) => ({ ...prev, [chartType]: data.insight }));
      }
    } catch (err) {
      console.error("Failed to get insight:", err);
    } finally {
      setLoadingInsights((prev) => ({ ...prev, [chartType]: false }));
    }
  };

  // Get overall AI commentary
  const getOverallInsight = async () => {
    if (!analytics) return;

    setLoadingOverallInsight(true);
    try {
      const res = await fetch(
        `${API_URL}/api/admin/claims-analytics/overall-insight`,
        {
          method: "POST",
          headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
          body: JSON.stringify({
            analytics,
            tenantIds: selectedCorporates,
            corporateNames: selectedCorporates
              .map(
                (id) =>
                  corporates.find((c) => c.tenant_id === id)
                    ?.corporate_legal_name,
              )
              .filter(Boolean),
          }),
        },
      );
      const data = await res.json();
      if (data.success) {
        setOverallInsight(data.insight);
      }
    } catch (err) {
      console.error("Failed to get overall insight:", err);
    } finally {
      setLoadingOverallInsight(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    document.cookie = "admin_token=; path=/; max-age=0";
    window.location.href = "https://www.benefitnest.space";
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: colors.gray[50] }}>
      {/* Header */}
      <header
        style={{
          background: "linear-gradient(135deg, #1e293b, #334155)",
          padding: "16px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            onClick={() => router.push("/admin/dashboard")}
            style={{
              width: "44px",
              height: "44px",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "0 4px 15px rgba(99, 102, 241, 0.4)",
            }}
          >
            <span style={{ fontSize: "24px" }}>🐝</span>
          </div>
          <div>
            <h1
              style={{
                color: "white",
                fontSize: "20px",
                fontWeight: "700",
                margin: 0,
              }}
            >
              Reports & Analytics
            </h1>
            <p
              style={{
                color: "rgba(255,255,255,0.7)",
                fontSize: "12px",
                margin: 0,
              }}
            >
              Claims Intelligence Dashboard
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button
            onClick={() => router.push("/admin/dashboard")}
            style={{
              padding: "10px 20px",
              backgroundColor: "rgba(255,255,255,0.1)",
              color: "white",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "10px",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            ← Dashboard
          </button>

          <div style={{ position: "relative" }}>
            <div
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              style={{
                width: "44px",
                height: "44px",
                background: "linear-gradient(135deg, #10b981, #059669)",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "white",
                fontWeight: "700",
                fontSize: "16px",
              }}
            >
              {adminProfile?.name?.charAt(0).toUpperCase() || "A"}
            </div>

            {showProfileMenu && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  right: 0,
                  backgroundColor: "white",
                  borderRadius: "12px",
                  boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
                  minWidth: "220px",
                  overflow: "hidden",
                  zIndex: 100,
                }}
              >
                <div
                  style={{
                    padding: "16px",
                    borderBottom: `1px solid ${colors.gray[100]}`,
                  }}
                >
                  <div style={{ fontWeight: "600", color: colors.gray[800] }}>
                    {adminProfile?.name}
                  </div>
                  <div style={{ fontSize: "12px", color: colors.gray[500] }}>
                    {adminProfile?.email}
                  </div>
                  <div
                    style={{
                      marginTop: "6px",
                      display: "inline-block",
                      padding: "2px 8px",
                      backgroundColor: colors.primaryLight,
                      color: colors.primary,
                      borderRadius: "4px",
                      fontSize: "10px",
                      fontWeight: "600",
                    }}
                  >
                    {adminProfile?.role}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    backgroundColor: "white",
                    border: "none",
                    textAlign: "left",
                    cursor: "pointer",
                    fontSize: "14px",
                    color: colors.danger,
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  🚪 Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ padding: "32px", maxWidth: "1600px", margin: "0 auto" }}>
        {/* Corporate Selection */}
        <div
          style={{
            backgroundColor: "white",
            padding: "24px",
            borderRadius: "16px",
            marginBottom: "24px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "24px" }}>🏢</span>
              <span style={{ fontWeight: "600", color: colors.gray[700] }}>
                Select Corporates:
              </span>
            </div>
            <MultiSelectDropdown
              options={corporates}
              selected={selectedCorporates}
              onChange={setSelectedCorporates}
              placeholder="Choose corporates to analyze..."
            />
            {selectedCorporates.length > 0 && (
              <button
                onClick={loadAnalytics}
                disabled={loading}
                style={{
                  padding: "12px 24px",
                  background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: loading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                {loading ? "⏳ Loading..." : "📊 Analyze"}
              </button>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div
            style={{
              padding: "16px 20px",
              backgroundColor: colors.dangerLight,
              color: "#991b1b",
              borderRadius: "12px",
              marginBottom: "24px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <span>⚠️</span> {error}
          </div>
        )}

        {/* No Selection State */}
        {selectedCorporates.length === 0 && !loading && (
          <div
            style={{
              backgroundColor: "white",
              padding: "60px 40px",
              borderRadius: "20px",
              textAlign: "center",
              boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
            }}
          >
            <div style={{ fontSize: "60px", marginBottom: "16px" }}>📊</div>
            <h2
              style={{
                fontSize: "24px",
                fontWeight: "700",
                color: colors.gray[800],
                marginBottom: "8px",
              }}
            >
              Claims Analysis Dashboard
            </h2>
            <p
              style={{
                color: colors.gray[500],
                fontSize: "16px",
                maxWidth: "500px",
                margin: "0 auto",
              }}
            >
              Select one or more corporates above to view comprehensive claims
              analytics with AI-powered insights
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div
            style={{
              backgroundColor: "white",
              padding: "60px 40px",
              borderRadius: "20px",
              textAlign: "center",
              boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
            }}
          >
            <div
              style={{
                fontSize: "40px",
                marginBottom: "16px",
                animation: "pulse 1.5s infinite",
              }}
            >
              📈
            </div>
            <h3 style={{ color: colors.gray[600], fontWeight: "500" }}>
              Analyzing claims data...
            </h3>
          </div>
        )}

        {/* Analytics Dashboard */}
        {analytics && !loading && (
          <>
            {/* KPI Cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "16px",
                marginBottom: "24px",
              }}
            >
              {[
                {
                  label: "Total Claims",
                  value: analytics.totalClaims.toLocaleString(),
                  icon: "📋",
                  color: colors.primary,
                },
                {
                  label: "Claimed Amount",
                  value: `₹${(analytics.totalClaimedAmount / 100000).toFixed(1)}L`,
                  icon: "💰",
                  color: colors.warning,
                },
                {
                  label: "Approved Amount",
                  value: `₹${(analytics.totalApprovedAmount / 100000).toFixed(1)}L`,
                  icon: "✅",
                  color: colors.success,
                },
                {
                  label: "Rejected Claims",
                  value: analytics.totalRejected.toLocaleString(),
                  icon: "❌",
                  color: colors.danger,
                },
                {
                  label: "Avg Settlement Days",
                  value: `${analytics.avgSettlementDays} days`,
                  icon: "⏱️",
                  color: colors.info,
                },
              ].map((kpi, i) => (
                <div
                  key={i}
                  style={{
                    backgroundColor: "white",
                    padding: "20px",
                    borderRadius: "16px",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                    border: `1px solid ${colors.gray[100]}`,
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                  }}
                >
                  <div
                    style={{
                      width: "50px",
                      height: "50px",
                      borderRadius: "12px",
                      backgroundColor: `${kpi.color}15`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "24px",
                    }}
                  >
                    {kpi.icon}
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: colors.gray[500],
                        marginBottom: "2px",
                      }}
                    >
                      {kpi.label}
                    </div>
                    <div
                      style={{
                        fontSize: "22px",
                        fontWeight: "700",
                        color: kpi.color,
                      }}
                    >
                      {kpi.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "24px",
                marginBottom: "24px",
              }}
            >
              {/* Chart 1: Claims by Status */}
              <DonutChart
                data={analytics.claimsByStatus}
                title="Claims by Status"
                onInsightClick={() =>
                  getChartInsight(
                    "status",
                    analytics.claimsByStatus,
                    "Claims by Status",
                  )
                }
                insight={chartInsights.status}
                loadingInsight={loadingInsights.status}
              />

              {/* Chart 2: Claims by Type */}
              <DonutChart
                data={analytics.claimsByType}
                title="Claims by Type"
                onInsightClick={() =>
                  getChartInsight(
                    "type",
                    analytics.claimsByType,
                    "Claims by Type",
                  )
                }
                insight={chartInsights.type}
                loadingInsight={loadingInsights.type}
              />

              {/* Chart 3: Monthly Trends */}
              <div style={{ gridColumn: "span 2" }}>
                <AreaChart
                  data={analytics.monthlyTrends}
                  title="Monthly Claims Trend (Last 12 Months)"
                  onInsightClick={() =>
                    getChartInsight(
                      "monthly",
                      analytics.monthlyTrends,
                      "Monthly Claims Trend",
                    )
                  }
                  insight={chartInsights.monthly}
                  loadingInsight={loadingInsights.monthly}
                />
              </div>

              {/* Chart 4: Top Hospitals */}
              <BarChart
                data={analytics.topHospitals}
                title="Top Hospitals by Claims"
                horizontal={true}
                onInsightClick={() =>
                  getChartInsight(
                    "hospitals",
                    analytics.topHospitals,
                    "Top Hospitals by Claims",
                  )
                }
                insight={chartInsights.hospitals}
                loadingInsight={loadingInsights.hospitals}
              />

              {/* Chart 5: Claims by Category */}
              <BarChart
                data={analytics.claimsByCategory}
                title="Claims by Category"
                horizontal={false}
                onInsightClick={() =>
                  getChartInsight(
                    "category",
                    analytics.claimsByCategory,
                    "Claims by Category",
                  )
                }
                insight={chartInsights.category}
                loadingInsight={loadingInsights.category}
              />
            </div>

            {/* AI Overall Commentary Box */}
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "20px",
                overflow: "hidden",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                border: `1px solid ${colors.gray[100]}`,
              }}
            >
              <div
                style={{
                  padding: "20px 24px",
                  background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "12px" }}
                >
                  <span style={{ fontSize: "28px" }}>🤖</span>
                  <div>
                    <h3
                      style={{
                        color: "white",
                        fontSize: "18px",
                        fontWeight: "700",
                        margin: 0,
                      }}
                    >
                      AI-Powered Claims Intelligence
                    </h3>
                    <p
                      style={{
                        color: "rgba(255,255,255,0.8)",
                        fontSize: "12px",
                        margin: 0,
                      }}
                    >
                      Comprehensive analysis and predictive insights
                    </p>
                  </div>
                </div>
                <button
                  onClick={getOverallInsight}
                  disabled={loadingOverallInsight}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: loadingOverallInsight
                      ? "rgba(255,255,255,0.3)"
                      : "white",
                    color: loadingOverallInsight
                      ? "rgba(255,255,255,0.7)"
                      : colors.primary,
                    border: "none",
                    borderRadius: "10px",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: loadingOverallInsight ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  {loadingOverallInsight
                    ? "⏳ Generating..."
                    : "✨ Generate Full Analysis"}
                </button>
              </div>

              <div style={{ padding: "24px", minHeight: "200px" }}>
                {!overallInsight && !loadingOverallInsight && (
                  <div style={{ textAlign: "center", padding: "40px" }}>
                    <div
                      style={{
                        fontSize: "40px",
                        marginBottom: "12px",
                        opacity: 0.3,
                      }}
                    >
                      💡
                    </div>
                    <p style={{ color: colors.gray[500], fontSize: "15px" }}>
                      Click &quot;Generate Full Analysis&quot; to get AI-powered
                      insights on your claims data, including risk predictions,
                      cost optimization opportunities, and strategic
                      recommendations.
                    </p>
                  </div>
                )}

                {loadingOverallInsight && (
                  <div style={{ textAlign: "center", padding: "40px" }}>
                    <div
                      style={{
                        fontSize: "40px",
                        marginBottom: "12px",
                        animation: "pulse 1.5s infinite",
                      }}
                    >
                      🔮
                    </div>
                    <p style={{ color: colors.gray[600], fontWeight: "500" }}>
                      AI is analyzing your claims data...
                    </p>
                    <p style={{ color: colors.gray[400], fontSize: "13px" }}>
                      This may take a few moments
                    </p>
                  </div>
                )}

                {overallInsight && !loadingOverallInsight && (
                  <div
                    style={{
                      fontSize: "15px",
                      color: colors.gray[700],
                      lineHeight: 1.8,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {overallInsight.split("\n").map((paragraph, i) => (
                      <p
                        key={i}
                        style={{
                          marginBottom: "16px",
                          padding:
                            paragraph.startsWith("•") ||
                            paragraph.startsWith("-")
                              ? "0 0 0 16px"
                              : "0",
                        }}
                      >
                        {paragraph.startsWith("**") &&
                        paragraph.endsWith("**") ? (
                          <strong
                            style={{
                              color: colors.gray[800],
                              fontSize: "16px",
                            }}
                          >
                            {paragraph.replace(/\*\*/g, "")}
                          </strong>
                        ) : paragraph.startsWith("##") ? (
                          <strong
                            style={{
                              color: colors.primary,
                              fontSize: "17px",
                              display: "block",
                              marginTop: "12px",
                            }}
                          >
                            {paragraph.replace(/##/g, "").trim()}
                          </strong>
                        ) : (
                          paragraph
                        )}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
      <AdminFooter />

      <style jsx global>{`
        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
}
