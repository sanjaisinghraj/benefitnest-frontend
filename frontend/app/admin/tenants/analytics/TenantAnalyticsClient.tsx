"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { gql } from "@apollo/client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#A28BFE",
  "#FF6699",
];

export default function TenantAnalyticsClient() {
  const { data: session } = useSession();
  const [tenants, setTenants] = useState<any[]>([]);
  const [facts, setFacts] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [tenantId, setTenantId] = useState("");
  const [country, setCountry] = useState("");
  const [planType, setPlanType] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [loading, setLoading] = useState(false);
  const [branding, setBranding] = useState<any>({
    font: "Inter, sans-serif",
    background: "#fff",
    color: "#222",
  });
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isCorporateAdmin, setIsCorporateAdmin] = useState(false);
  const [featureFlags, setFeatureFlags] = useState<any>({});
  const [selectedTenant, setSelectedTenant] = useState<string>("");
  const [flagMessage, setFlagMessage] = useState("");
  const [exportHistory, setExportHistory] = useState<any[]>([]);

  useEffect(() => {
    // Assume roles and tenantId are in session.user as custom properties
    const roles = (session?.user as any)?.roles || [];
    setIsSuperAdmin(roles.includes("super-admin"));
    setIsCorporateAdmin(roles.includes("corporate-admin"));
    setBranding({
      font: "Inter, sans-serif",
      background: "#fff",
      color: "#222",
    });
    fetchTenants();
  }, [session]);

  const fetchTenants = async () => {
    setLoading(true);
    // TODO: Replace with actual Apollo Client usage
    setLoading(false);
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    // TODO: Replace with actual Apollo Client usage
    setLoading(false);
  };

  useEffect(() => {
    if (isSuperAdmin) fetchAnalytics();
  }, [tenantId, country, planType, dateRange, isSuperAdmin]);

  // Aggregations
  const activeTenants = tenants.filter((t) => t.status === "active").length;
  const inactiveTenants = tenants.filter((t) => t.status !== "active").length;
  const adoptionData = [
    { name: "Active", value: activeTenants },
    { name: "Inactive", value: inactiveTenants },
  ];

  const enrollmentRates = facts
    .filter((f) => f.actionType === "enrollment")
    .reduce(
      (acc, f) => {
        acc[f.planType] = (acc[f.planType] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

  const premiumTotals = facts.reduce((acc, f) => acc + (f.premium || 0), 0);
  const walletTotals = facts.reduce((acc, f) => acc + (f.walletUsage || 0), 0);

  // Compliance by country
  const complianceByCountry = tenants.reduce(
    (acc, t) => {
      const key = t.country_code;
      acc[key] = acc[key] || { GDPR: 0, HIPAA: 0, IRDAI: 0, total: 0 };
      if (t.compliance_flags?.includes("GDPR")) acc[key].GDPR++;
      if (t.compliance_flags?.includes("HIPAA")) acc[key].HIPAA++;
      if (t.compliance_flags?.includes("IRDAI")) acc[key].IRDAI++;
      acc[key].total++;
      return acc;
    },
    {} as Record<
      string,
      { GDPR: number; HIPAA: number; IRDAI: number; total: number }
    >,
  );

  if (!isSuperAdmin && !isCorporateAdmin)
    return <div style={{ padding: 32 }}>Access denied.</div>;

  return (
    <div
      style={{
        fontFamily: branding.font,
        background: branding.background,
        color: branding.color,
        minHeight: "100vh",
        padding: 32,
      }}
    >
      <h1>Tenant Analytics Dashboard</h1>
      <div style={{ marginBottom: 16 }}>
        <button onClick={() => {}}>Export CSV</button>
        <button onClick={() => {}} style={{ marginLeft: 8 }}>
          Export XLSX
        </button>
        <button onClick={() => {}} style={{ marginLeft: 8 }}>
          Export PDF
        </button>
      </div>
      {(isSuperAdmin || isCorporateAdmin) && (
        <div
          style={{
            marginBottom: 16,
            padding: 8,
            border: "1px solid #eee",
            background: "#fafafa",
          }}
        >
          <strong>Feature Flags Panel Placeholder</strong>
          {/* TODO: Implement FeatureFlagsPanel */}
        </div>
      )}
      {flagMessage && (
        <div style={{ color: "green", marginBottom: 8 }}>{flagMessage}</div>
      )}
      <div
        style={{
          marginBottom: 16,
          padding: 8,
          border: "1px solid #eee",
          background: "#fafafa",
        }}
      >
        <strong>Export History Table Placeholder</strong>
        {/* TODO: Implement ExportHistoryTable */}
      </div>
      <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
        <input
          placeholder="Tenant ID"
          value={tenantId}
          onChange={(e) => setTenantId(e.target.value)}
        />
        <input
          placeholder="Country"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
        />
        <input
          placeholder="Plan Type"
          value={planType}
          onChange={(e) => setPlanType(e.target.value)}
        />
        <input
          type="date"
          value={dateRange.from}
          onChange={(e) =>
            setDateRange((r) => ({ ...r, from: e.target.value }))
          }
        />
        <input
          type="date"
          value={dateRange.to}
          onChange={(e) => setDateRange((r) => ({ ...r, to: e.target.value }))}
        />
        <button onClick={fetchAnalytics} disabled={loading}>
          Refresh
        </button>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 32 }}>
          <div style={{ flex: 1, minWidth: 350 }}>
            <h3>Tenant Adoption</h3>
            <PieChart width={250} height={250}>
              <Pie
                data={adoptionData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
              >
                {adoptionData.map((entry, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
            <div style={{ fontWeight: 600, marginTop: 8 }}>
              Active: {activeTenants} | Inactive: {inactiveTenants}
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 350 }}>
            <h3>Enrollment Rates by Plan</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={Object.entries(enrollmentRates).map(([plan, count]) => ({
                  plan,
                  count,
                }))}
              >
                <XAxis dataKey="plan" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#0088FE" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ flex: 1, minWidth: 350 }}>
            <h3>Premium Totals</h3>
            <PieChart width={250} height={250}>
              <Pie
                data={[{ name: "Premium", value: premiumTotals }]}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#00C49F"
              >
                <Cell key="cell-0" fill="#00C49F" />
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
            <div style={{ fontWeight: 600, marginTop: 8 }}>
              Total: ₹{premiumTotals.toLocaleString()}
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 350 }}>
            <h3>Wallet Usage</h3>
            <PieChart width={250} height={250}>
              <Pie
                data={[{ name: "Wallet", value: walletTotals }]}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#A28BFE"
              >
                <Cell key="cell-0" fill="#A28BFE" />
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
            <div style={{ fontWeight: 600, marginTop: 8 }}>
              Total: ₹{walletTotals.toLocaleString()}
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 350 }}>
            <h3>Compliance Status by Country</h3>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginTop: 8,
              }}
            >
              <thead>
                <tr>
                  <th>Country</th>
                  <th>GDPR</th>
                  <th>HIPAA</th>
                  <th>IRDAI</th>
                  <th>Total Tenants</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(complianceByCountry).map(([country, data]) => {
                  const d = data as {
                    GDPR: number;
                    HIPAA: number;
                    IRDAI: number;
                    total: number;
                  };
                  return (
                    <tr key={country}>
                      <td>{country}</td>
                      <td>{d.GDPR}</td>
                      <td>{d.HIPAA}</td>
                      <td>{d.IRDAI}</td>
                      <td>{d.total}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
